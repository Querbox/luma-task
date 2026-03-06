import SwiftUI
import SwiftData

struct FocusView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(ToastManager.self) private var toastManager
    @Query(sort: \LumaTask.createdAt, order: .reverse) private var allTasks: [LumaTask]

    @State private var viewModel = TaskListViewModel()
    @State private var selectedTask: LumaTask?
    @State private var suggestion: TaskSuggestion?

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: LumaSpacing.sm) {
                    // Suggestion banner
                    if let suggestion {
                        SuggestionBanner(
                            suggestion: suggestion,
                            onAccept: { acceptSuggestion(suggestion) },
                            onDismiss: { self.suggestion = nil }
                        )
                        .padding(.horizontal, LumaSpacing.lg)
                    }

                    let today = viewModel.todayTasks(from: allTasks)
                    let soon = viewModel.soonTasks(from: allTasks)
                    let later = viewModel.laterTasks(from: allTasks)

                    // Heute section
                    if today.isEmpty && soon.isEmpty && later.isEmpty {
                        EmptyStateView(
                            icon: "checkmark.circle",
                            message: "Keine Aufgaben für heute"
                        )
                        .padding(.horizontal, LumaSpacing.lg)
                    } else {
                        taskSection(tasks: today)
                    }

                    // Demnächst section
                    if !soon.isEmpty {
                        sectionHeader("Demnächst")
                        taskSection(tasks: soon)
                    }

                    // Später section
                    if !later.isEmpty {
                        sectionHeader("Später")
                        taskSection(tasks: later)
                    }
                }
                .padding(.top, LumaSpacing.sm)
                .padding(.bottom, 100) // Space for input bar
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
                    toastManager.show("Aufgabe hinzugefügt", type: .success)

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
        Text(title)
            .font(.lumaSection)
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, LumaSpacing.lg)
            .padding(.top, LumaSpacing.lg)
    }

    @ViewBuilder
    private func taskSection(tasks: [LumaTask]) -> some View {
        ForEach(tasks) { task in
            TaskItemView(
                task: task,
                onToggle: {
                    viewModel.toggleTask(task)
                    toastManager.show(
                        task.isCompleted ? "Aufgabe abgeschlossen" : "Aufgabe wiederhergestellt",
                        type: .success
                    )
                },
                onDelete: {
                    viewModel.deleteTask(task, context: modelContext)
                    toastManager.show("Aufgabe gelöscht", type: .warning)
                },
                onTap: {
                    selectedTask = task
                    HapticService.shared.light()
                }
            )
            .padding(.horizontal, LumaSpacing.lg)
            .transition(.asymmetric(
                insertion: .move(edge: .trailing).combined(with: .opacity),
                removal: .move(edge: .leading).combined(with: .opacity)
            ))
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: allTasks.count)
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
            toastManager.show("Vorschlag angewendet", type: .success)
        }
        self.suggestion = nil
    }
}
