import SwiftUI
import SwiftData

struct FocusView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \LumaTask.createdAt, order: .reverse) private var allTasks: [LumaTask]

    @State private var viewModel = TaskListViewModel()
    @State private var selectedTask: LumaTask?
    @State private var suggestion: TaskSuggestion?
    @State private var justCreatedId: UUID?

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: LumaSpacing.sm) {
                    // Suggestion banner
                    if let suggestion {
                        SuggestionBanner(
                            suggestion: suggestion,
                            onAccept: { acceptSuggestion(suggestion) },
                            onDismiss: {
                                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                                    self.suggestion = nil
                                }
                            }
                        )
                        .padding(.horizontal, LumaSpacing.lg)
                    }

                    let today = viewModel.todayTasks(from: allTasks)
                    let soon = viewModel.soonTasks(from: allTasks)
                    let later = viewModel.laterTasks(from: allTasks)

                    if today.isEmpty && soon.isEmpty && later.isEmpty {
                        EmptyStateView(
                            icon: "checkmark.circle",
                            message: "Keine Aufgaben für heute"
                        )
                        .padding(.horizontal, LumaSpacing.lg)
                    } else {
                        taskSection(tasks: today)
                    }

                    if !soon.isEmpty {
                        sectionHeader("Demnächst")
                        taskSection(tasks: soon)
                    }

                    if !later.isEmpty {
                        sectionHeader("Später")
                        taskSection(tasks: later)
                    }
                }
                .padding(.top, LumaSpacing.sm)
                .padding(.bottom, 100)
            }
            .navigationTitle("Heute")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Text(Date().formattedGermanMedium)
                        .font(.lumaSmall)
                        .foregroundStyle(.secondary)
                }
            }
            .safeAreaInset(edge: .bottom) {
                TaskInputBar { input in
                    let task = viewModel.createTask(from: input, context: modelContext)

                    withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                        justCreatedId = task.id
                    }
                    Task { @MainActor in
                        try? await Task.sleep(for: .milliseconds(800))
                        withAnimation(.easeOut(duration: 0.3)) {
                            justCreatedId = nil
                        }
                    }

                    if task.hasReminder {
                        NotificationService.shared.scheduleReminder(for: task)
                    }
                    if task.dueDate != nil {
                        NotificationService.shared.scheduleDueNotification(for: task)
                    }
                }
            }
            .sheet(item: $selectedTask) { task in
                TaskDetailSheet(task: task)
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
                    .presentationBackground(.ultraThinMaterial)
            }
        }
        .onAppear {
            suggestion = viewModel.getSuggestion(for: allTasks)
        }
    }

    // MARK: - Subviews

    @ViewBuilder
    private func sectionHeader(_ title: String) -> some View {
        HStack(spacing: LumaSpacing.md) {
            Text(title)
                .font(.lumaSection)
                .foregroundStyle(.secondary)

            Rectangle()
                .fill(.secondary.opacity(0.15))
                .frame(height: 0.5)
        }
        .padding(.horizontal, LumaSpacing.lg)
        .padding(.top, LumaSpacing.xl)
    }

    @ViewBuilder
    private func taskSection(tasks: [LumaTask]) -> some View {
        ForEach(tasks) { task in
            TaskItemView(
                task: task,
                isHighlighted: task.id == justCreatedId,
                onToggle: {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                        viewModel.toggleTask(task)
                    }
                },
                onDelete: {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                        viewModel.deleteTask(task, context: modelContext)
                    }
                },
                onTap: {
                    selectedTask = task
                    HapticService.shared.light()
                }
            )
            .padding(.horizontal, LumaSpacing.lg)
            .transition(.asymmetric(
                insertion: .push(from: .bottom).combined(with: .opacity),
                removal: .push(from: .trailing).combined(with: .opacity)
            ))
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: tasks.map(\.id))
    }

    private func acceptSuggestion(_ suggestion: TaskSuggestion) {
        if let task = allTasks.first(where: { $0.id == suggestion.taskId }) {
            switch suggestion.type {
            case .recurringWeekly:
                task.recurrence = TaskRecurrence(type: .weekly)
            case .dailyHabit:
                task.recurrence = TaskRecurrence(type: .daily)
            case .setTime, .adjustDate:
                break
            }
            HapticService.shared.success()
        }
        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
            self.suggestion = nil
        }
    }
}
