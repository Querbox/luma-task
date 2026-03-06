import SwiftUI

extension Color {
    // MARK: - Accent Colors
    static let lumaAccent = Color(hex: "0A84FF")
    static let lumaDanger = Color(hex: "FF453A")
    static let lumaSuccess = Color(hex: "30D158")
    static let lumaWarning = Color(hex: "FF9F0A")

    // MARK: - Heatmap
    static let lumaHeatmapRed = Color(hex: "FF2D55")
}

// MARK: - ShapeStyle Convenience

extension ShapeStyle where Self == Color {
    static var lumaAccent: Color { .lumaAccent }
    static var lumaDanger: Color { .lumaDanger }
    static var lumaSuccess: Color { .lumaSuccess }
    static var lumaWarning: Color { .lumaWarning }
    static var lumaHeatmapRed: Color { .lumaHeatmapRed }

    // MARK: - Hex Initializer
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
