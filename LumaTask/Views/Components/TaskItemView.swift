import SwiftUI

struct TaskItemView: View {
    let task: LumaTask
    var isHighlighted: Bool = false
    let onToggle: () -> Void
    let onDelete: () -> Void
    let onTap: () -> Void

    @State private var offset: CGFloat = 0
    @State private var thresholdState: ThresholdState = .none
    @State private var checkScale: CGFloat = 1.0
    @State private var showCompletionBurst = false
    @GestureState private var isDragging = false

    private let threshold: CGFloat = 80

    private enum ThresholdState {
        case none, complete, delete
    }

    private var swipeProgress: CGFloat {
        min(1, abs(offset) / threshold)
    }

    var body: some View {
        ZStack {
            // Action backgrounds
            HStack {
                // Complete action (right swipe)
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(.white)
                        .scaleEffect(thresholdState == .complete ? 1.2 : swipeProgress)
                        .rotationEffect(.degrees(thresholdState == .complete ? 0 : Double(-90) * Double(1 - swipeProgress)))
                        .animation(.spring(response: 0.25, dampingFraction: 0.6), value: thresholdState)
                    Spacer()
                }
                .padding(.leading, LumaSpacing.xl)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.lumaSuccess.opacity(swipeProgress * 0.9))
                .clipShape(RoundedRectangle(cornerRadius: LumaRadius.md, style: .continuous))
                .opacity(offset > 0 ? 1 : 0)

                // Delete action (left swipe)
                HStack {
                    Spacer()
                    Image(systemName: "trash.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(.white)
                        .scaleEffect(thresholdState == .delete ? 1.2 : swipeProgress)
                        .animation(.spring(response: 0.25, dampingFraction: 0.6), value: thresholdState)
                }
                .padding(.trailing, LumaSpacing.xl)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.lumaDanger.opacity(swipeProgress * 0.9))
                .clipShape(RoundedRectangle(cornerRadius: LumaRadius.md, style: .continuous))
                .opacity(offset < 0 ? 1 : 0)
            }

            // Main content
            HStack(spacing: LumaSpacing.md) {
                // Checkbox
                Button(action: {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                        checkScale = 1.3
                    }
                    if !task.isCompleted {
                        showCompletionBurst = true
                    }
                    onToggle()
                    HapticService.shared.success()

                    Task { @MainActor in
                        try? await Task.sleep(for: .milliseconds(200))
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                            checkScale = 1.0
                            showCompletionBurst = false
                        }
                    }
                }) {
                    ZStack {
                        Circle()
                            .stroke(
                                task.isCompleted ? Color.lumaAccent : Color.secondary.opacity(0.4),
                                lineWidth: 1.5
                            )
                            .frame(width: 24, height: 24)

                        if task.isCompleted {
                            Circle()
                                .fill(Color.lumaAccent.opacity(0.15))
                                .frame(width: 24, height: 24)

                            Image(systemName: "checkmark")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundStyle(.lumaAccent)
                                .transition(.scale.combined(with: .opacity))
                        }

                        // Completion burst
                        if showCompletionBurst {
                            Circle()
                                .stroke(Color.lumaAccent.opacity(0.4), lineWidth: 2)
                                .frame(width: 36, height: 36)
                                .scaleEffect(showCompletionBurst ? 1.5 : 0.8)
                                .opacity(showCompletionBurst ? 0 : 1)
                                .animation(.easeOut(duration: 0.5), value: showCompletionBurst)
                        }
                    }
                    .scaleEffect(checkScale)
                    .animation(.spring(response: 0.3, dampingFraction: 0.7), value: task.isCompleted)
                }
                .buttonStyle(.plain)

                // Content
                VStack(alignment: .leading, spacing: LumaSpacing.xs) {
                    HStack(spacing: LumaSpacing.sm) {
                        if let icon = task.icon {
                            Text(icon)
                                .font(.lumaBody)
                        }

                        Text(task.title)
                            .font(.lumaBody)
                            .strikethrough(task.isCompleted)
                            .foregroundStyle(task.isCompleted ? .tertiary : .primary)
                            .lineLimit(2)
                            .contentTransition(.opacity)
                    }

                    // Metadata row
                    if task.dueDate != nil || !task.tags.isEmpty || task.hasReminder || task.recurrence != nil {
                        HStack(spacing: LumaSpacing.sm) {
                            if let dueDate = task.dueDate {
                                Label(dueDate.formattedGerman, systemImage: "calendar")
                                    .font(.lumaSmall)
                                    .foregroundStyle(
                                        dueDate.isPast && !task.isCompleted ? .lumaDanger : .secondary
                                    )
                            }

                            if task.hasReminder {
                                Image(systemName: "bell.fill")
                                    .font(.system(size: 11))
                                    .foregroundStyle(.lumaWarning)
                            }

                            if let recurrence = task.recurrence {
                                Label(recurrence.displayLabel, systemImage: "arrow.clockwise")
                                    .font(.lumaCaption)
                                    .foregroundStyle(.lumaAccent.opacity(0.7))
                            }

                            ForEach(task.tags, id: \.self) { tag in
                                Text(tag)
                                    .font(.lumaCaption)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(.lumaAccent.opacity(0.12))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                }

                Spacer(minLength: 0)
            }
            .padding(.horizontal, LumaSpacing.lg)
            .padding(.vertical, LumaSpacing.md)
            .glassBackground(cornerRadius: LumaRadius.md)
            .opacity(task.isCompleted ? 0.65 : 1)
            .scaleEffect(isDragging ? 0.98 : 1.0)
            .offset(x: offset)
            .gesture(
                DragGesture(minimumDistance: 20)
                    .updating($isDragging) { _, state, _ in
                        state = true
                    }
                    .onChanged { value in
                        withAnimation(.interactiveSpring) {
                            offset = value.translation.width * 0.6
                        }

                        let newState: ThresholdState
                        if value.translation.width > threshold {
                            newState = .complete
                        } else if value.translation.width < -threshold {
                            newState = .delete
                        } else {
                            newState = .none
                        }

                        if newState != thresholdState {
                            if newState != .none {
                                HapticService.shared.threshold()
                            }
                            thresholdState = newState
                        }
                    }
                    .onEnded { value in
                        if value.translation.width > threshold {
                            HapticService.shared.success()
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                                offset = 400
                            }
                            Task { @MainActor in
                                try? await Task.sleep(for: .milliseconds(200))
                                onToggle()
                                offset = 0
                            }
                        } else if value.translation.width < -threshold {
                            HapticService.shared.error()
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                                offset = -400
                            }
                            Task { @MainActor in
                                try? await Task.sleep(for: .milliseconds(200))
                                onDelete()
                                offset = 0
                            }
                        } else {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                offset = 0
                            }
                        }
                        thresholdState = .none
                    }
            )
            .onTapGesture(perform: onTap)
            .animation(.spring(response: 0.3, dampingFraction: 0.8), value: isDragging)
        }
        // Highlight glow for just-created tasks
        .overlay {
            if isHighlighted {
                RoundedRectangle(cornerRadius: LumaRadius.md, style: .continuous)
                    .stroke(Color.lumaAccent.opacity(0.5), lineWidth: 1.5)
                    .shadow(color: .lumaAccent.opacity(0.2), radius: 8)
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: isHighlighted)
    }
}
