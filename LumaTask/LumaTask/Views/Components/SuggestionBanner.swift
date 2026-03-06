import SwiftUI

struct SuggestionBanner: View {
    let suggestion: TaskSuggestion
    let onAccept: () -> Void
    let onDismiss: () -> Void

    @State private var isVisible = true

    var body: some View {
        if isVisible {
            HStack(spacing: LumaSpacing.md) {
                Image(systemName: "lightbulb.fill")
                    .foregroundStyle(.lumaWarning)
                    .font(.system(size: 18))

                Text(suggestion.message)
                    .font(.lumaSecondary)
                    .foregroundStyle(.primary)
                    .lineLimit(2)

                Spacer()

                Button(action: {
                    onAccept()
                    HapticService.shared.success()
                    dismiss()
                }) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(.lumaSuccess)
                }
                .buttonStyle(.plain)

                Button(action: {
                    onDismiss()
                    dismiss()
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, LumaSpacing.lg)
            .padding(.vertical, LumaSpacing.md)
            .glassBackground(cornerRadius: LumaRadius.md)
            .transition(.move(edge: .top).combined(with: .opacity))
            .task {
                try? await Task.sleep(for: .seconds(12))
                dismiss()
            }
        }
    }

    private func dismiss() {
        withAnimation(.easeOut(duration: 0.3)) {
            isVisible = false
        }
    }
}
