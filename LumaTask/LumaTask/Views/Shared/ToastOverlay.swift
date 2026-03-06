import SwiftUI

enum ToastType {
    case success
    case info
    case error
    case warning

    var color: Color {
        switch self {
        case .success: return .lumaSuccess
        case .info: return .lumaAccent
        case .error: return .lumaDanger
        case .warning: return .lumaWarning
        }
    }

    var icon: String {
        switch self {
        case .success: return "checkmark.circle.fill"
        case .info: return "info.circle.fill"
        case .error: return "xmark.circle.fill"
        case .warning: return "exclamationmark.triangle.fill"
        }
    }
}

struct Toast: Identifiable {
    let id = UUID()
    let message: String
    let type: ToastType
}

@Observable
final class ToastManager {
    var toasts: [Toast] = []

    func show(_ message: String, type: ToastType = .success) {
        let toast = Toast(message: message, type: type)
        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
            toasts.append(toast)
        }
        HapticService.shared.light()

        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(3600))
            withAnimation(.easeOut(duration: 0.25)) {
                toasts.removeAll { $0.id == toast.id }
            }
        }
    }

    func remove(_ id: UUID) {
        withAnimation(.easeOut(duration: 0.2)) {
            toasts.removeAll { $0.id == id }
        }
    }
}

struct ToastOverlay: View {
    let manager: ToastManager

    var body: some View {
        VStack(spacing: LumaSpacing.sm) {
            ForEach(manager.toasts) { toast in
                ToastItemView(toast: toast) {
                    manager.remove(toast.id)
                }
                .transition(.move(edge: .top).combined(with: .opacity))
            }
            Spacer()
        }
        .padding(.top, 60)
        .padding(.horizontal, LumaSpacing.lg)
        .allowsHitTesting(!manager.toasts.isEmpty)
    }
}

private struct ToastItemView: View {
    let toast: Toast
    let onDismiss: () -> Void

    var body: some View {
        HStack(spacing: LumaSpacing.md) {
            Image(systemName: toast.type.icon)
                .foregroundStyle(toast.type.color)
                .font(.system(size: 18))

            Text(toast.message)
                .font(.lumaSecondary)
                .foregroundStyle(.primary)

            Spacer()
        }
        .padding(.horizontal, LumaSpacing.lg)
        .padding(.vertical, LumaSpacing.md)
        .glassBackground(cornerRadius: LumaRadius.md)
        .overlay(
            Rectangle()
                .fill(toast.type.color)
                .frame(width: 3)
                .clipShape(
                    UnevenRoundedRectangle(
                        topLeadingRadius: LumaRadius.md,
                        bottomLeadingRadius: LumaRadius.md
                    )
                ),
            alignment: .leading
        )
        .onTapGesture(perform: onDismiss)
    }
}
