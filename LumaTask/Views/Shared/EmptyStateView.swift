import SwiftUI

struct EmptyStateView: View {
    let icon: String
    let message: String

    @State private var isAnimating = false

    init(icon: String = "checkmark.circle", message: String = "Keine Aufgaben") {
        self.icon = icon
        self.message = message
    }

    var body: some View {
        VStack(spacing: LumaSpacing.md) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundStyle(.tertiary)
                .symbolEffect(.pulse.wholeSymbol, options: .repeating.speed(0.5), value: isAnimating)

            Text(message)
                .font(.lumaSecondary)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, LumaSpacing.xxxl)
        .onAppear { isAnimating = true }
    }
}
