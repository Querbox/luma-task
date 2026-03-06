import SwiftUI
import SwiftData

struct CalendarTabView: View {
    @Query(sort: \LumaTask.dueDate) private var allTasks: [LumaTask]
    @State private var viewModel = CalendarViewModel()
    @State private var selectedTask: LumaTask?

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 2), count: 7)

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: LumaSpacing.lg) {
                    // Month navigation
                    HStack {
                        Button(action: viewModel.previousMonth) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 18, weight: .semibold))
                        }

                        Spacer()

                        Text(viewModel.monthTitle)
                            .font(.lumaSection)

                        Spacer()

                        Button(action: viewModel.nextMonth) {
                            Image(systemName: "chevron.right")
                                .font(.system(size: 18, weight: .semibold))
                        }
                    }
                    .padding(.horizontal, LumaSpacing.xl)
                    .foregroundStyle(.primary)

                    // Weekday headers
                    LazyVGrid(columns: columns, spacing: 2) {
                        ForEach(viewModel.weekdayLabels, id: \.self) { label in
                            Text(label)
                                .font(.lumaCaption)
                                .foregroundStyle(.secondary)
                                .frame(height: 24)
                        }
                    }
                    .padding(.horizontal, LumaSpacing.lg)

                    // Calendar grid
                    LazyVGrid(columns: columns, spacing: 2) {
                        ForEach(Array(viewModel.daysInMonth().enumerated()), id: \.offset) { _, date in
                            if let date {
                                CalendarDayCell(
                                    date: date,
                                    isSelected: date.isSameDay(as: viewModel.selectedDate),
                                    isToday: date.isToday,
                                    taskCount: viewModel.taskCount(for: date, from: allTasks)
                                )
                                .onTapGesture {
                                    viewModel.selectDate(date)
                                }
                            } else {
                                Color.clear
                                    .frame(height: 44)
                            }
                        }
                    }
                    .padding(.horizontal, LumaSpacing.lg)

                    // Selected date tasks
                    VStack(alignment: .leading, spacing: LumaSpacing.sm) {
                        Text(viewModel.selectedDateLabel)
                            .font(.lumaSection)
                            .padding(.horizontal, LumaSpacing.lg)

                        let dayTasks = viewModel.tasksForDay(viewModel.selectedDate, from: allTasks)

                        if dayTasks.isEmpty {
                            EmptyStateView(
                                icon: "calendar.badge.checkmark",
                                message: "Keine Aufgaben"
                            )
                        } else {
                            ForEach(dayTasks) { task in
                                TaskItemView(
                                    task: task,
                                    onToggle: {
                                        task.isCompleted.toggle()
                                        task.completedAt = task.isCompleted ? Date() : nil
                                        HapticService.shared.success()
                                    },
                                    onDelete: {
                                        // Handled in parent
                                    },
                                    onTap: {
                                        selectedTask = task
                                    }
                                )
                                .padding(.horizontal, LumaSpacing.lg)
                            }
                        }
                    }
                    .padding(.top, LumaSpacing.lg)
                }
                .padding(.top, LumaSpacing.sm)
            }
            .navigationTitle("Plan")
            .sheet(item: $selectedTask) { task in
                TaskDetailSheet(task: task)
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
                    .presentationBackground(.ultraThinMaterial)
            }
        }
    }
}

// MARK: - Calendar Day Cell

private struct CalendarDayCell: View {
    let date: Date
    let isSelected: Bool
    let isToday: Bool
    let taskCount: Int

    private let calendar = Calendar.current

    var body: some View {
        VStack(spacing: 2) {
            Text("\(calendar.component(.day, from: date))")
                .font(.system(size: 16, weight: isToday ? .bold : .regular))
                .foregroundStyle(isSelected ? .white : isToday ? .lumaAccent : .primary)

            // Task dots (max 3)
            HStack(spacing: 2) {
                ForEach(0..<min(taskCount, 3), id: \.self) { _ in
                    Circle()
                        .fill(isSelected ? .white : .lumaAccent)
                        .frame(width: 4, height: 4)
                }
            }
            .frame(height: 6)
        }
        .frame(height: 44)
        .frame(maxWidth: .infinity)
        .background {
            if isSelected {
                Circle()
                    .fill(.lumaAccent)
                    .frame(width: 36, height: 36)
            }
        }
    }
}
