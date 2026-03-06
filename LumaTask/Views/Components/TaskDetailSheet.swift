import SwiftUI

struct TaskDetailSheet: View {
    @Bindable var task: LumaTask
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext

    @State private var editedTitle: String = ""
    @State private var editedNotes: String = ""
    @State private var showDatePicker = false
    @State private var showReminderPicker = false
    @State private var showRecurrencePicker = false
    @State private var showEmojiPicker = false
    @State private var selectedDate: Date = Date()
    @State private var newTag: String = ""

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
                        // Icon/Emoji
                        DetailRow(
                            icon: "face.smiling",
                            title: "Symbol",
                            value: task.icon ?? "Keins"
                        ) {
                            toggleSection(.emoji)
                        }

                        if showEmojiPicker {
                            emojiGrid
                                .transition(.opacity.combined(with: .offset(y: -10)))
                        }

                        Divider().padding(.leading, 50)

                        // Priority
                        DetailRow(
                            icon: "flag",
                            title: "Priorität",
                            value: TaskPriority(rawValue: task.priority)?.label ?? "Keine",
                            valueColor: TaskPriority(rawValue: task.priority)?.color
                        ) {
                            let next = (task.priority + 1) % 4
                            task.priority = next
                            HapticService.shared.light()
                        }

                        Divider().padding(.leading, 50)

                        // Date
                        DetailRow(
                            icon: "calendar",
                            title: "Datum",
                            value: task.dueDate?.formattedGerman ?? "Kein Datum"
                        ) {
                            toggleSection(.date)
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
                            toggleSection(.recurrence)
                        }

                        if showRecurrencePicker {
                            recurrenceOptions
                                .transition(.opacity.combined(with: .offset(y: -10)))
                        }

                        Divider().padding(.leading, 50)

                        // Reminder
                        DetailRow(
                            icon: "bell",
                            title: "Erinnerung",
                            value: task.reminderDate?.formattedGerman ?? "Keine"
                        ) {
                            toggleSection(.reminder)
                        }

                        if showReminderPicker {
                            reminderOptions
                                .transition(.opacity.combined(with: .offset(y: -10)))
                        }
                    }
                    .glassBackground(cornerRadius: LumaRadius.md)

                    // Notes
                    VStack(alignment: .leading, spacing: LumaSpacing.sm) {
                        Label("Notizen", systemImage: "note.text")
                            .font(.lumaSecondary)
                            .foregroundStyle(.secondary)

                        TextField("Notiz hinzufügen...", text: $editedNotes, axis: .vertical)
                            .font(.lumaBody)
                            .lineLimit(3...8)
                            .onChange(of: editedNotes) { _, newValue in
                                task.notes = newValue
                            }
                    }
                    .padding(LumaSpacing.lg)
                    .glassBackground(cornerRadius: LumaRadius.md)

                    // Tags
                    VStack(alignment: .leading, spacing: LumaSpacing.sm) {
                        Label("Tags", systemImage: "tag")
                            .font(.lumaSecondary)
                            .foregroundStyle(.secondary)

                        FlowLayout(spacing: LumaSpacing.sm) {
                            ForEach(task.tags, id: \.self) { tag in
                                HStack(spacing: LumaSpacing.xs) {
                                    Text(tag)
                                        .font(.lumaSmall)
                                    Button {
                                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                            task.tags.removeAll { $0 == tag }
                                        }
                                        HapticService.shared.light()
                                    } label: {
                                        Image(systemName: "xmark")
                                            .font(.system(size: 10, weight: .bold))
                                    }
                                }
                                .foregroundStyle(.lumaAccent)
                                .padding(.horizontal, LumaSpacing.sm)
                                .padding(.vertical, LumaSpacing.xs)
                                .background(.lumaAccent.opacity(0.12))
                                .clipShape(Capsule())
                            }
                        }

                        HStack(spacing: LumaSpacing.sm) {
                            TextField("Neuer Tag...", text: $newTag)
                                .font(.lumaSecondary)
                                .submitLabel(.done)
                                .onSubmit(addTag)

                            if !newTag.isEmpty {
                                Button(action: addTag) {
                                    Image(systemName: "plus.circle.fill")
                                        .foregroundStyle(.lumaAccent)
                                }
                                .transition(.scale.combined(with: .opacity))
                            }
                        }
                        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: newTag.isEmpty)
                    }
                    .padding(LumaSpacing.lg)
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

                        // Postpone
                        if task.dueDate != nil && !task.isCompleted {
                            Button {
                                postponeTask()
                            } label: {
                                Label("Auf morgen verschieben", systemImage: "arrow.right.circle")
                                    .font(.lumaBodySemibold)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, LumaSpacing.md)
                            }
                            .buttonStyle(.bordered)
                            .tint(.lumaWarning)
                        }

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
            editedNotes = task.notes
            if let dueDate = task.dueDate {
                selectedDate = dueDate
            }
        }
    }

    // MARK: - Collapse Helper

    private enum ExpandedSection {
        case date, reminder, recurrence, emoji
    }

    private func toggleSection(_ section: ExpandedSection) {
        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
            let wasOpen: Bool
            switch section {
            case .date: wasOpen = showDatePicker
            case .reminder: wasOpen = showReminderPicker
            case .recurrence: wasOpen = showRecurrencePicker
            case .emoji: wasOpen = showEmojiPicker
            }
            showDatePicker = false
            showReminderPicker = false
            showRecurrencePicker = false
            showEmojiPicker = false
            switch section {
            case .date: showDatePicker = !wasOpen
            case .reminder: showReminderPicker = !wasOpen
            case .recurrence: showRecurrencePicker = !wasOpen
            case .emoji: showEmojiPicker = !wasOpen
            }
        }
        HapticService.shared.light()
    }

    // MARK: - Emoji Grid

    @ViewBuilder
    private var emojiGrid: some View {
        let emojis = ["📝", "📞", "🛒", "💪", "📚", "💊", "🏠", "💼",
                      "🎯", "✈️", "🎂", "🧹", "💰", "📧", "🏃", "🍳",
                      "🐶", "🌱", "🔧", "📦", "🎵", "💡", "⭐️", "🧘"]

        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 8), spacing: LumaSpacing.md) {
            // Remove option
            Button {
                task.icon = nil
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    showEmojiPicker = false
                }
                HapticService.shared.light()
            } label: {
                Image(systemName: "xmark.circle")
                    .font(.system(size: 22))
                    .foregroundStyle(.secondary)
                    .frame(width: 36, height: 36)
            }

            ForEach(emojis, id: \.self) { emoji in
                Button {
                    task.icon = emoji
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                        showEmojiPicker = false
                    }
                    HapticService.shared.medium()
                } label: {
                    Text(emoji)
                        .font(.system(size: 28))
                        .frame(width: 36, height: 36)
                        .background(
                            task.icon == emoji
                                ? Color.lumaAccent.opacity(0.2) : Color.clear
                        )
                        .clipShape(RoundedRectangle(cornerRadius: LumaRadius.sm))
                }
            }
        }
        .padding()
    }

    // MARK: - Recurrence Options

    @ViewBuilder
    private var recurrenceOptions: some View {
        VStack(spacing: LumaSpacing.sm) {
            recurrenceButton("Nie", type: nil)
            recurrenceButton("Täglich", type: .daily)
            recurrenceButton("Wöchentlich", type: .weekly)
            recurrenceButton("Alle 2 Wochen", type: .biweekly)
            recurrenceButton("Monatlich", type: .monthly)
            recurrenceButton("Jährlich", type: .yearly)
        }
        .padding()
    }

    @ViewBuilder
    private func recurrenceButton(_ label: String, type: RecurrenceType?) -> some View {
        Button {
            if let type {
                task.recurrence = TaskRecurrence(type: type)
            } else {
                task.recurrence = nil
            }
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                showRecurrencePicker = false
            }
            HapticService.shared.medium()
        } label: {
            HStack {
                Text(label)
                    .font(.lumaSecondary)
                Spacer()
                if (type == nil && task.recurrence == nil) ||
                    (type != nil && task.recurrence?.type == type) {
                    Image(systemName: "checkmark")
                        .foregroundStyle(.lumaAccent)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, LumaSpacing.sm)
            .padding(.horizontal, LumaSpacing.md)
        }
        .buttonStyle(.plain)
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

    // MARK: - Helpers

    private var tomorrowMorning: Date {
        let tomorrow = Date().addingDays(1)
        let calendar = Calendar.current
        var components = calendar.dateComponents([.year, .month, .day], from: tomorrow)
        components.hour = 8
        components.minute = 0
        return calendar.date(from: components) ?? tomorrow
    }

    private func addTag() {
        let trimmed = newTag.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty, !task.tags.contains(trimmed) else { return }
        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
            task.tags.append(trimmed)
        }
        newTag = ""
        HapticService.shared.light()
    }

    private func postponeTask() {
        let calendar = Calendar.current
        let tomorrow = calendar.startOfDay(for: Date().addingDays(1))

        if let currentDue = task.dueDate {
            let timeComponents = calendar.dateComponents([.hour, .minute], from: currentDue)
            var tomorrowComponents = calendar.dateComponents([.year, .month, .day], from: tomorrow)
            tomorrowComponents.hour = timeComponents.hour
            tomorrowComponents.minute = timeComponents.minute
            task.dueDate = calendar.date(from: tomorrowComponents) ?? tomorrow
        } else {
            task.dueDate = tomorrow
        }

        if task.originalDueDate == nil {
            task.originalDueDate = task.dueDate
        }
        task.postponedCount += 1

        NotificationService.shared.cancelNotifications(for: task.id)
        NotificationService.shared.scheduleDueNotification(for: task)
        if task.hasReminder {
            NotificationService.shared.scheduleReminder(for: task)
        }

        HapticService.shared.medium()
    }
}

// MARK: - Detail Row

private struct DetailRow: View {
    let icon: String
    let title: String
    let value: String
    var valueColor: Color? = nil
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
                    .foregroundStyle(valueColor ?? .secondary)
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

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrangeSubviews(proposal: proposal, subviews: subviews).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrangeSubviews(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: .unspecified
            )
        }
    }

    private func arrangeSubviews(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (positions, CGSize(width: maxWidth, height: y + rowHeight))
    }
}
