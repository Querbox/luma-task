import SwiftUI

struct TaskItemView: View {
    let task: LumaTask
    let onToggle: () -> Void
    let onDelete: () -> Void
    let onTap: () -> Void

    @State private var offset: CGFloat = 0
    @State private var thresholdState: ThresholdState = .none
    @GestureState private var isDragging = false

    private let threshold: CGFloat = 80

    private enum ThresholdState {
        case none, complete, delete
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
                    Spacer()
                }
                .padding(.leading, LumaSpacing.xl)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.lumaSuccess.opacity(min(1, abs(offset) / threshold)))
                .clipShape(RoundedRectangle(cornerRadius: LumaRadius.md, style: .continuous))
                .opacity(offset > 0 ? 1 : 0)

                // Delete action (left swipe)
                HStack {
                    Spacer()
                    Image(systemName: "trash.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(.white)
                }
                .padding(.trailing, LumaSpacing.xl)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.lumaDanger.opacity(min(1, abs(offset) / threshold)))
                .clipShape(RoundedRectangle(cornerRadius: LumaRadius.md, style: .continuous))
                .opacity(offset < 0 ? 1 : 0)
            }

            // Main content
            HStack(spacing: LumaSpacing.md) {
                // Checkbox
                Button(action: {
                    onToggle()
                    HapticService.shared.success()
                }) {
                    ZStack {
                        Circle()
                            .stroke(
                                task.isCompleted ? Color.lumaAccent : Color.secondary.opacity(0.4),
                                lineWidth: 1.5
                            )
                            .frame(width: 24, height: 24)

                        if task.isCompleted {
                            Image(systemName: "checkmark")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundStyle(.lumaAccent)
                                .transition(.scale.combined(with: .opacity))
                        }
                    }
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
                    }

                    // Metadata row
                    if task.dueDate != nil || !task.tags.isEmpty || task.hasReminder {
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

                            ForEach(task.tags, id: \.self) { tag in
                                Text(tag)
                                    .font(.lumaCaption)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(.lumaAccent.opacity(0.15))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                }

                Spacer()
            }
            .padding(.horizontal, LumaSpacing.lg)
            .padding(.vertical, LumaSpacing.md)
            .glassBackground(cornerRadius: LumaRadius.md)
            .offset(x: offset)
            .gesture(
                DragGesture(minimumDistance: 20)
                    .updating($isDragging) { _, state, _ in
                        state = true
                    }
                    .onChanged { value in
                        offset = value.translation.width * 0.6 // Elastic

                        // Threshold haptics
                        if value.translation.width > threshold && thresholdState != .complete {
                            thresholdState = .complete
                            HapticService.shared.threshold()
                        } else if value.translation.width < -threshold && thresholdState != .delete {
                            thresholdState = .delete
                            HapticService.shared.threshold()
                        } else if abs(value.translation.width) < threshold {
                            thresholdState = .none
                        }
                    }
                    .onEnded { value in
                        if value.translation.width > threshold {
                            onToggle()
                            HapticService.shared.success()
                        } else if value.translation.width < -threshold {
                            onDelete()
                            HapticService.shared.error()
                        }

                        withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                            offset = 0
                        }
                        thresholdState = .none
                    }
            )
            .onTapGesture(perform: onTap)
        }
    }
}
