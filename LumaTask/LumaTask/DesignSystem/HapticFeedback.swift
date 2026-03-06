import UIKit

enum HapticType {
    case light
    case medium
    case heavy
    case success
    case error
    case threshold
    case none
}

@MainActor
final class HapticService {
    static let shared = HapticService()

    private init() {}

    func light() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    func medium() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    func heavy() {
        UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
    }

    func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    func error() {
        UINotificationFeedbackGenerator().notificationOccurred(.error)
    }

    func threshold() {
        UISelectionFeedbackGenerator().selectionChanged()
    }

    func trigger(_ type: HapticType) {
        switch type {
        case .light: light()
        case .medium: medium()
        case .heavy: heavy()
        case .success: success()
        case .error: error()
        case .threshold: threshold()
        case .none: break
        }
    }
}
