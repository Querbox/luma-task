import Foundation

struct DateParser {
    private let normalizer = TextNormalizer()
    private let calendar = Calendar.current

    private let weekdays: [String: Int] = [
        "so": 1, "sonntag": 1, "sunday": 1, "sun": 1,
        "mo": 2, "montag": 2, "monday": 2, "mon": 2,
        "di": 3, "dienstag": 3, "tuesday": 3, "tue": 3,
        "mi": 4, "mittwoch": 4, "wednesday": 4, "wed": 4,
        "do": 5, "donnerstag": 5, "thursday": 5, "thu": 5,
        "fr": 6, "freitag": 6, "friday": 6, "fri": 6,
        "sa": 7, "samstag": 7, "saturday": 7, "sat": 7
    ]

    func parseRelativeDate(_ text: String) -> (Date?, String) {
        let now = Date()
        let remaining = text

        if remaining.range(of: "\\b(heute|today)\\b", options: [.regularExpression, .caseInsensitive]) != nil {
            return (now, normalizer.consume(remaining, pattern: "\\b(heute|today)\\b"))
        }

        if remaining.range(of: "\\b(morgen|tomorrow)\\b", options: [.regularExpression, .caseInsensitive]) != nil {
            return (now.addingDays(1), normalizer.consume(remaining, pattern: "\\b(morgen|tomorrow)\\b"))
        }

        if remaining.range(of: "\\b(übermorgen|uebermorgen)\\b", options: [.regularExpression, .caseInsensitive]) != nil {
            return (now.addingDays(2), normalizer.consume(remaining, pattern: "\\b(übermorgen|uebermorgen)\\b"))
        }

        if remaining.range(of: "\\b(nächste woche|naechste woche|next week)\\b", options: [.regularExpression, .caseInsensitive]) != nil {
            return (now.addingWeeks(1), normalizer.consume(remaining, pattern: "\\b(nächste woche|naechste woche|next week)\\b"))
        }

        // "in X tagen/wochen/monaten"
        let relativePattern = "\\b(in)\\s+(\\d+)\\s+(tagen?|wochen?|monaten?|days?|weeks?|months?)\\b"
        if let match = remaining.firstMatch(for: relativePattern) {
            let amountStr = match.group(2) ?? "0"
            let amount = Int(amountStr) ?? 0
            let unit = (match.group(3) ?? "").lowercased()

            var date = now
            if unit.hasPrefix("tag") || unit.hasPrefix("day") {
                date = now.addingDays(amount)
            } else if unit.hasPrefix("woch") || unit.hasPrefix("week") {
                date = now.addingWeeks(amount)
            } else if unit.hasPrefix("monat") || unit.hasPrefix("month") {
                date = now.addingMonths(amount)
            }

            return (date, normalizer.consume(remaining, pattern: relativePattern))
        }

        return (nil, remaining)
    }

    func parseWeekdayDate(_ text: String) -> (Date?, String) {
        let now = Date()
        let remaining = text

        for (key, weekdayIndex) in weekdays {
            let pattern = "\\b(am|on|next|nächsten?|nächster|naechsten?)?\\s*\(NSRegularExpression.escapedPattern(for: key))\\b"
            if remaining.range(of: pattern, options: [.regularExpression, .caseInsensitive]) != nil {
                if let nextDate = calendar.nextDate(after: now, matching: DateComponents(weekday: weekdayIndex), matchingPolicy: .nextTime) {
                    return (nextDate, normalizer.consume(remaining, pattern: pattern))
                }
            }
        }

        return (nil, remaining)
    }
}
