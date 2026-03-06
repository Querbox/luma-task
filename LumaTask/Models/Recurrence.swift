import Foundation

enum RecurrenceType: String, Codable, CaseIterable {
    case daily
    case weekly
    case biweekly
    case monthly
    case yearly
    case interval
    case weekday
}

enum RecurrenceUnit: String, Codable {
    case day
    case week
    case month
    case year
}

struct TaskRecurrence: Codable, Equatable, Hashable {
    var type: RecurrenceType
    var interval: Int?
    var weekday: Int?
    var unit: RecurrenceUnit?
    var daysOfWeek: [Int]?

    var displayLabel: String {
        switch type {
        case .daily:
            return "Täglich"
        case .weekly:
            if let weekday = weekday {
                let formatter = DateFormatter()
                formatter.locale = Locale(identifier: "de_DE")
                let weekdayName = formatter.weekdaySymbols[weekday]
                return "Jeden \(weekdayName)"
            }
            return "Wöchentlich"
        case .biweekly:
            return "Alle 2 Wochen"
        case .monthly:
            return "Monatlich"
        case .yearly:
            return "Jährlich"
        case .interval:
            guard let interval = interval, let unit = unit else { return "Wiederholt" }
            let unitLabel: String
            switch unit {
            case .day: unitLabel = interval == 1 ? "Tag" : "Tage"
            case .week: unitLabel = interval == 1 ? "Woche" : "Wochen"
            case .month: unitLabel = interval == 1 ? "Monat" : "Monate"
            case .year: unitLabel = interval == 1 ? "Jahr" : "Jahre"
            }
            return interval == 1 ? "Jede \(unitLabel)" : "Alle \(interval) \(unitLabel)"
        case .weekday:
            if let weekday = weekday {
                let formatter = DateFormatter()
                formatter.locale = Locale(identifier: "de_DE")
                let weekdayName = formatter.weekdaySymbols[weekday]
                return "Jeden \(weekdayName)"
            }
            return "Wiederholt"
        }
    }
}
