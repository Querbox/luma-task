import Foundation

struct TitleCleaner {
    func clean(_ text: String) -> String {
        var title = text.trimmingCharacters(in: .whitespaces)

        // Remove punctuation at edges
        title = title.replacingOccurrences(of: "^([,.\\- ]+)|([,.\\- ]+)$", with: "", options: .regularExpression)
            .trimmingCharacters(in: .whitespaces)

        // Remove dangling prepositions at end
        title = title.replacingOccurrences(
            of: "\\b(am|um|im|in|zum|zur|beim|für|fuer|mit|ab|bis|on|at|ins)\\s*$",
            with: "",
            options: [.regularExpression, .caseInsensitive]
        ).trimmingCharacters(in: .whitespaces)

        // Remove dangling prepositions at start
        title = title.replacingOccurrences(
            of: "^\\s*(am|um|im|in|zum|zur|beim|für|fuer|mit|ab|bis|on|at|ins)\\s+",
            with: "",
            options: [.regularExpression, .caseInsensitive]
        ).trimmingCharacters(in: .whitespaces)

        // Capitalize first letter
        if let first = title.first {
            title = first.uppercased() + title.dropFirst()
        }

        return title.isEmpty ? "Aufgabe" : title
    }
}
