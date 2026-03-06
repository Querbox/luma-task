import Foundation

struct TimeParser {
    private let normalizer = TextNormalizer()

    struct TimeResult {
        let hours: Int?
        let minutes: Int?
        let remaining: String
    }

    private let timeKeywords: [(pattern: String, hour: Int)] = [
        ("\\b(morgens?|morning|früh|frueh|early|vormittags?|frühstück|fruehstueck|breakfast)\\b", 8),
        ("\\b(mittags?|noon|lunch|mittagessen)\\b", 12),
        ("\\b(nachmittags?|afternoon)\\b", 15),
        ("\\b(abends?|evening|tonight|dinner|abendessen)\\b", 19),
        ("\\b(nachts?|night|midnight)\\b", 23)
    ]

    func parse(_ text: String) -> TimeResult {
        var remaining = text

        // HH:MM or HH.MM format
        let timePattern = "\\b(\\d{1,2})[:.]?(\\d{2})\\b"
        if let match = remaining.firstMatch(for: timePattern) {
            let hours = Int(match.group(1) ?? "0") ?? 0
            let minutes = Int(match.group(2) ?? "0") ?? 0
            if hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 {
                return TimeResult(
                    hours: hours,
                    minutes: minutes,
                    remaining: normalizer.consume(remaining, pattern: "\\b\(match.group(0) ?? "")\\b")
                )
            }
        }

        // H uhr/am/pm format
        let ampmPattern = "\\b(\\d{1,2})\\s*(uhr|am|pm|a\\.m\\.|p\\.m\\.)\\b"
        if let match = remaining.firstMatch(for: ampmPattern) {
            var hours = Int(match.group(1) ?? "0") ?? 0
            let period = (match.group(2) ?? "").lowercased()
            if period.contains("pm") && hours < 12 { hours += 12 }
            if period.contains("am") && hours == 12 { hours = 0 }
            return TimeResult(
                hours: hours,
                minutes: 0,
                remaining: normalizer.consume(remaining, pattern: ampmPattern)
            )
        }

        // Time keywords
        for keyword in timeKeywords {
            if remaining.range(of: keyword.pattern, options: [.regularExpression, .caseInsensitive]) != nil {
                return TimeResult(
                    hours: keyword.hour,
                    minutes: 0,
                    remaining: normalizer.consume(remaining, pattern: keyword.pattern)
                )
            }
        }

        return TimeResult(hours: nil, minutes: nil, remaining: remaining)
    }

    func applyTime(to date: Date, hours: Int, minutes: Int) -> Date {
        let calendar = Calendar.current
        var components = calendar.dateComponents([.year, .month, .day], from: date)
        components.hour = hours
        components.minute = minutes
        components.second = 0
        return calendar.date(from: components) ?? date
    }
}
