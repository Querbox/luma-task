import SwiftUI

struct TaskInputBar: View {
    @State private var inputText = ""
    @State private var sendScale: CGFloat = 1.0
    @FocusState private var isFocused: Bool

    let parser = TaskParser()
    let onSubmit: (String) -> Void

    private var preview: ParsedTaskResult? {
        guard !inputText.trimmingCharacters(in: .whitespaces).isEmpty else { return nil }
        return parser.parse(inputText)
    }

    private var hasPreviewContent: Bool {
        guard let preview else { return false }
        return preview.icon != nil || !preview.tags.isEmpty || preview.date != nil || preview.recurrence != nil
    }

    var body: some View {
        VStack(spacing: LumaSpacing.sm) {
            // NLP Preview chips
            if hasPreviewContent, let preview {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: LumaSpacing.sm) {
                        if let icon = preview.icon {
                            ChipView(text: icon)
                                .transition(.scale.combined(with: .opacity))
                        }

                        ForEach(preview.tags, id: \.self) { tag in
                            ChipView(text: "#\(tag)", color: .lumaAccent)
                                .transition(.scale.combined(with: .opacity))
                        }

                        if let date = preview.date {
                            ChipView(
                                icon: "calendar",
                                text: date.formattedGerman,
                                color: .lumaAccent
                            )
                            .transition(.scale.combined(with: .opacity))
                        }

                        if let time = preview.time {
                            ChipView(
                                icon: "clock",
                                text: time,
                                color: .lumaAccent
                            )
                            .transition(.scale.combined(with: .opacity))
                        }

                        if let recurrence = preview.recurrence {
                            ChipView(
                                icon: "arrow.clockwise",
                                text: recurrence.displayLabel,
                                color: .lumaWarning
                            )
                            .transition(.scale.combined(with: .opacity))
                        }
                    }
                    .padding(.horizontal, LumaSpacing.lg)
                }
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }

            // Input row
            HStack(spacing: LumaSpacing.md) {
                TextField("Neue Aufgabe...", text: $inputText)
                    .font(.lumaBody)
                    .focused($isFocused)
                    .submitLabel(.send)
                    .onSubmit(submit)

                Button(action: submit) {
                    Image(systemName: inputText.isEmpty ? "plus" : "paperplane.fill")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(.lumaAccent)
                        .contentTransition(.symbolEffect(.replace))
                        .scaleEffect(sendScale)
                        .frame(width: 36, height: 36)
                }
                .disabled(inputText.trimmingCharacters(in: .whitespaces).isEmpty)
                .opacity(inputText.isEmpty ? 0.5 : 1)
                .animation(.easeInOut(duration: 0.2), value: inputText.isEmpty)
            }
            .padding(.horizontal, LumaSpacing.lg)
            .padding(.vertical, LumaSpacing.md)
            .glassBackgroundInteractive(cornerRadius: LumaRadius.xl)
        }
        .padding(.horizontal, LumaSpacing.lg)
        .padding(.bottom, LumaSpacing.sm)
        .animation(.spring(response: 0.35, dampingFraction: 0.75), value: hasPreviewContent)
    }

    private func submit() {
        let trimmed = inputText.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }

        // Send button bounce
        withAnimation(.spring(response: 0.2, dampingFraction: 0.4)) {
            sendScale = 0.7
        }
        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(100))
            withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                sendScale = 1.0
            }
        }

        onSubmit(trimmed)
        withAnimation(.easeOut(duration: 0.15)) {
            inputText = ""
        }
        HapticService.shared.medium()
    }
}

// MARK: - Chip View

private struct ChipView: View {
    let text: String
    var icon: String? = nil
    var color: Color = .secondary

    init(text: String, color: Color = .secondary) {
        self.text = text
        self.icon = nil
        self.color = color
    }

    init(icon: String, text: String, color: Color = .secondary) {
        self.icon = icon
        self.text = text
        self.color = color
    }

    var body: some View {
        HStack(spacing: LumaSpacing.xs) {
            if let icon {
                Image(systemName: icon)
                    .font(.system(size: 11))
            }
            Text(text)
                .font(.lumaSmall)
        }
        .foregroundStyle(color)
        .padding(.horizontal, LumaSpacing.sm)
        .padding(.vertical, LumaSpacing.xs)
        .background(color.opacity(0.12))
        .clipShape(Capsule())
    }
}
