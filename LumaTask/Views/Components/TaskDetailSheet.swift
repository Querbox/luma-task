import SwiftUI

struct TaskDetailSheet: View {
    @Bindable var task: LumaTask
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext

    @State private var editedTitle: String = ""
    @State private var showDatePicker = false
    @State private var showReminderPicker = false
    @State private var selectedDate: Date = Date()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: LumaSpacing.xl) {
                    // Title
                    TextField("Aufgabe", text: $editedTitle)
                        .font(.lumaTitle)
                        .onSubmit {
                            task.title = editedTitle
                            HapticService.shared.light()
                        }

                    // Info rows
                    VStack(spacing: 0) {
                        // Date
                        DetailRow(
                            icon: "calendar",
                            title: "Datum",
                            value: task.dueDate?.formattedGerman ?? "Kein Datum"
                        ) {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                showDatePicker.toggle()
                                showReminderPicker = false
                            }
                            HapticService.shared.light()
                        }

                        if showDatePicker {
                            DatePicker(
                                "Datum wählen",
                                selection: $selectedDate,
                                displayedComponents: [.date, .hourAndMinute]
                            )
                            .datePickerStyle(.graphical)
                            .environment(\.locale, Locale(identifier: "de_DE"))
                            .padding()
                            .transition(.opacity.combined(with: .offset(y: -10)))
                            .onChange(of: selectedDate) { _, newDate in
                                task.dueDate = newDate
                                NotificationService.shared.scheduleDueNotification(for: task)
                                HapticService.shared.light()
                            }
                        }

                        Divider().padding(.leading, 50)

                        // Recurrence
                        DetailRow(
                            icon: "arrow.clockwise",
                            title: "Wiederholen",
                            value: task.recurrence?.displayLabel ?? "Nie"
                        ) {
                            cycleRecurrence()
                        }

                        Divider().padding(.leading, 50)

                        // Reminder
                        DetailRow(
                            icon: "bell",
                            title: "Erinnerung",
                            value: task.reminderDate?.formattedGerman ?? "Keine"
                        ) {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                showReminderPicker.toggle()
                                showDatePicker = false
                            }
                            HapticService.shared.light()
                        }

                        if showReminderPicker {
                            reminderOptions
                                .transition(.opacity.combined(with: .offset(y: -10)))
                        }
                    }
                    .glassBackground(cornerRadius: LumaRadius.md)

                    // Actions
                    VStack(spacing: LumaSpacing.sm) {
                        Button {
                            task.isCompleted.toggle()
                            task.completedAt = task.isCompleted ? Date() : nil
                            HapticService.shared.success()
                            dismiss()
                        } label: {
                            Label(
                                task.isCompleted ? "Als unerledigt markieren" : "Erledigen",
                                systemImage: task.isCompleted ? "arrow.uturn.backward" : "checkmark.circle"
                            )
                            .font(.lumaBodySemibold)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, LumaSpacing.md)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.lumaAccent)

                        Button(role: .destructive) {
                            NotificationService.shared.cancelNotifications(for: task.id)
                            modelContext.delete(task)
                            HapticService.shared.error()
                            dismiss()
                        } label: {
                            Label("Löschen", systemImage: "trash")
                                .font(.lumaBodySemibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, LumaSpacing.md)
                        }
                        .buttonStyle(.bordered)
                        .tint(.lumaDanger)
                    }
                }
                .padding(LumaSpacing.xl)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fertig") {
                        if editedTitle != task.title && !editedTitle.isEmpty {
                            task.title = editedTitle
                        }
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            editedTitle = task.title
            if let dueDate = task.dueDate {
                selectedDate = dueDate
            }
        }
    }

    // MARK: - Reminder Options

    @ViewBuilder
    private var reminderOptions: some View {
        VStack(spacing: LumaSpacing.sm) {
            reminderButton("In 1 Stunde", date: Date().addingTimeInterval(3600))
            reminderButton("In 3 Stunden", date: Date().addingTimeInterval(10800))
            reminderButton("Morgen früh (8:00)", date: tomorrowMorning)

            if task.hasReminder {
                Button("Erinnerung entfernen") {
                    task.hasReminder = false
                    task.reminderDate = nil
                    NotificationService.shared.cancelNotifications(for: task.id)
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                        showReminderPicker = false
                    }
                    HapticService.shared.light()
                }
                .foregroundStyle(.lumaDanger)
                .font(.lumaSecondary)
            }
        }
        .padding()
    }

    @ViewBuilder
    private func reminderButton(_ label: String, date: Date) -> some View {
        Button {
            task.reminderDate = date
            task.hasReminder = true
            NotificationService.shared.scheduleReminder(for: task)
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                showReminderPicker = false
            }
            HapticService.shared.medium()
        } label: {
            Text(label)
                .font(.lumaSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, LumaSpacing.sm)
        }
        .buttonStyle(.bordered)
    }

    private var tomorrowMorning: Date {
        let tomorrow = Date().addingDays(1)
        let calendar = Calendar.current
        var components = calendar.dateComponents([.year, .month, .day], from: tomorrow)
        components.hour = 8
        components.minute = 0
        return calendar.date(from: components) ?? tomorrow
    }

    private func cycleRecurrence() {
        let types: [RecurrenceType?] = [nil, .daily, .weekly, .monthly]
        let currentIndex = types.firstIndex(where: { $0 == task.recurrence?.type }) ?? 0
        let nextIndex = (currentIndex + 1) % types.count

        if let type = types[nextIndex] {
            task.recurrence = TaskRecurrence(type: type)
        } else {
            task.recurrence = nil
        }
        HapticService.shared.light()
    }
}

// MARK: - Detail Row

private struct DetailRow: View {
    let icon: String
    let title: String
    let value: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundStyle(.lumaAccent)
                    .frame(width: 30)

                Text(title)
                    .font(.lumaBody)
                    .foregroundStyle(.primary)

                Spacer()

                Text(value)
                    .font(.lumaSecondary)
                    .foregroundStyle(.secondary)
                    .contentTransition(.numericText())

                Image(systemName: "chevron.right")
                    .font(.system(size: 12))
                    .foregroundStyle(.tertiary)
            }
            .padding(.horizontal, LumaSpacing.lg)
            .padding(.vertical, LumaSpacing.md)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
