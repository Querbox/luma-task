import SwiftUI

struct GlassCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(LumaSpacing.lg)
            .frame(maxWidth: .infinity, alignment: .leading)
            .glassBackground(cornerRadius: LumaRadius.lg)
    }
}
