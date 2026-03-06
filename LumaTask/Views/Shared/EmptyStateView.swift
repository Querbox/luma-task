import SwiftUI

struct EmptyStateView: View {
    let icon: String
    let message: String

    init(icon: String = "checkmark.circle", message: String = "Keine Aufgaben") {
        self.icon = icon
        self.message = message
    }

    var body: some View {
        VStack(spacing: LumaSpacing.md) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundStyle(.tertiary)

            Text(message)
                .font(.lumaSecondary)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, LumaSpacing.xxxl)
    }
}
