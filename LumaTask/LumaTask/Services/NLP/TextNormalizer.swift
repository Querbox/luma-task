import Foundation

struct TextNormalizer {
    private static let umlautMap: [Character: String] = [
        "ä": "ae", "ö": "oe", "ü": "ue",
        "Ä": "AE", "Ö": "OE", "Ü": "UE",
        "ß": "ss"
    ]

    private static let danglingPrepositions = "am|um|im|in|zum|zur|beim|für|mit|ab|bis|on|at|ins"

    func removeUmlauts(_ text: String) -> String {
        String(text.flatMap { char in
            Self.umlautMap[char].map(Array.init) ?? [char]
        })
    }

    func normalize(_ input: String) -> String {
        input
            .trimmingCharacters(in: .whitespaces)
            .lowercased()
            .replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
    }

    func normalizeForComparison(_ input: String) -> String {
        removeUmlauts(normalize(input))
    }

    func consume(_ text: String, pattern: String) -> String {
        var result = text.replacingOccurrences(of: pattern, with: " ", options: [.regularExpression, .caseInsensitive])
            .trimmingCharacters(in: .whitespaces)

        // Clean up dangling prepositions at end
        let endPattern = "\\s+(\(Self.danglingPrepositions))\\s*$"
        result = result.replacingOccurrences(of: endPattern, with: "", options: [.regularExpression, .caseInsensitive])

        // Clean up dangling prepositions at start
        let startPattern = "^\\s*(\(Self.danglingPrepositions))\\s+"
        result = result.replacingOccurrences(of: startPattern, with: "", options: [.regularExpression, .caseInsensitive])

        // Collapse whitespace
        result = result.replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
            .trimmingCharacters(in: .whitespaces)

        return result
    }

    func consumeLiteral(_ text: String, literal: String) -> String {
        let escaped = NSRegularExpression.escapedPattern(for: literal)
        return consume(text, pattern: escaped)
    }
}
