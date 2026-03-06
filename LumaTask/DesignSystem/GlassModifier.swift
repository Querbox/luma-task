import SwiftUI

struct GlassModifier: ViewModifier {
    var cornerRadius: CGFloat = LumaRadius.lg
    var isInteractive: Bool = false

    func body(content: Content) -> some View {
        if #available(iOS 26, *) {
            if isInteractive {
                content
                    .glassEffect(.regular.interactive(), in: .rect(cornerRadius: cornerRadius))
            } else {
                content
                    .glassEffect(.regular, in: .rect(cornerRadius: cornerRadius))
            }
        } else {
            content
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .stroke(Color.white.opacity(0.12), lineWidth: 0.5)
                )
                .shadow(color: .black.opacity(0.25), radius: 8, y: 2)
        }
    }
}

extension View {
    func glassBackground(cornerRadius: CGFloat = LumaRadius.lg) -> some View {
        modifier(GlassModifier(cornerRadius: cornerRadius))
    }

    func glassBackgroundInteractive(cornerRadius: CGFloat = LumaRadius.lg) -> some View {
        modifier(GlassModifier(cornerRadius: cornerRadius, isInteractive: true))
    }
}
