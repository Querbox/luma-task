import Foundation

struct RecurrenceParser {
    private let normalizer = TextNormalizer()

    private let weekdays: [String: Int] = [
        "sonntag": 0, "sunday": 0,
        "montag": 1, "monday": 1,
        "dienstag": 2, "tuesday": 2,
        "mittwoch": 3, "wednesday": 3,
        "donnerstag": 4, "thursday": 4,
        "freitag": 5, "friday": 5,
        "samstag": 6, "saturday": 6
    ]

    func parse(_ text: String) -> (TaskRecurrence?, String) {
        var remaining = text

        // DAILY
        let dailyPattern = "\\b(jeden tag|täglich|taeglich|every day|daily)\\b"
        if remaining.range(of: dailyPattern, options: [.regularExpression, .caseInsensitive]) != nil {
            return (TaskRecurrence(type: .daily), normalizer.consume(remaining, pattern: dailyPattern))
        }

        // MONTHLY
        let monthlyPattern = "\\b(jeden monat|monatlich|every month|monthly)\\b"
        if remaining.range(of: monthlyPattern, options: [.regularExpression, .caseInsensitive]) != nil {
            return (TaskRecurrence(type: .monthly), normalizer.consume(remaining, pattern: monthlyPattern))
        }

        // YEARLY
        let yearlyPattern = "\\b(jährlich|jaehrlich|yearly|every year|annually|jedes jahr)\\b"
        if remaining.range(of: yearlyPattern, options: [.regularExpression, .caseInsensitive]) != nil {
            return (TaskRecurrence(type: .yearly), normalizer.consume(remaining, pattern: yearlyPattern))
        }

        // EVERY X DAYS/WEEKS/MONTHS
        let everyXPattern = "\\b(alle?|every)\\s+(\\d+)\\s*(tagen?|wochen?|monaten?|days?|weeks?|months?)\\b"
        if let match = remaining.firstMatch(for: everyXPattern) {
            let amount = Int(match.group(2) ?? "0") ?? 0
            let unitStr = (match.group(3) ?? "").lowercased()

            var unit: RecurrenceUnit = .day
            var type: RecurrenceType = .interval

            if unitStr.hasPrefix("tag") || unitStr.hasPrefix("day") {
                unit = .day
            } else if unitStr.hasPrefix("woch") || unitStr.hasPrefix("week") {
                unit = .week
            } else if unitStr.hasPrefix("monat") || unitStr.hasPrefix("month") {
                unit = .month
                type = .monthly
            }

            let recurrence = TaskRecurrence(type: type, interval: amount, unit: unit)
            return (recurrence, normalizer.consume(remaining, pattern: everyXPattern))
        }

        // SPECIFIC WEEKDAY (e.g., "jeden Montag", "every Monday")
        let weekdayPattern = "\\b(jeden?|every|jede?|alle?)?\\s*(montag|monday|dienstag|tuesday|mittwoch|wednesday|donnerstag|thursday|freitag|friday|samstag|saturday|sonntag|sunday)\\b"
        if let match = remaining.firstMatch(for: weekdayPattern) {
            let dayName = (match.group(2) ?? "").lowercased()
            for (key, dayIdx) in weekdays {
                if dayName.contains(key.prefix(3)) || dayName == key {
                    let recurrence = TaskRecurrence(type: .weekday, weekday: dayIdx)
                    return (recurrence, normalizer.consume(remaining, pattern: weekdayPattern))
                }
            }
        }

        // WEEKLY (generic)
        let weeklyPattern = "\\b(jede woche|wöchentlich|woechentlich|every week|weekly)\\b"
        if remaining.range(of: weeklyPattern, options: [.regularExpression, .caseInsensitive]) != nil {
            return (TaskRecurrence(type: .weekly), normalizer.consume(remaining, pattern: weeklyPattern))
        }

        return (nil, remaining)
    }
}
