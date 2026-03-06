import Foundation

extension Date {
    private static let germanLocale = Locale(identifier: "de_DE")

    var formattedGerman: String {
        if Calendar.current.isDateInToday(self) {
            return "Heute"
        } else if Calendar.current.isDateInTomorrow(self) {
            return "Morgen"
        } else if Calendar.current.isDateInYesterday(self) {
            return "Gestern"
        } else {
            let formatter = DateFormatter()
            formatter.locale = Self.germanLocale
            formatter.dateFormat = "d. MMM"
            return formatter.string(from: self)
        }
    }

    var formattedGermanFull: String {
        let formatter = DateFormatter()
        formatter.locale = Self.germanLocale
        formatter.dateStyle = .full
        return formatter.string(from: self)
    }

    var formattedGermanMedium: String {
        let formatter = DateFormatter()
        formatter.locale = Self.germanLocale
        formatter.dateFormat = "EEEE, d. MMMM"
        return formatter.string(from: self)
    }

    var formattedMonthYear: String {
        let formatter = DateFormatter()
        formatter.locale = Self.germanLocale
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: self)
    }

    var formattedTime: String {
        let formatter = DateFormatter()
        formatter.locale = Self.germanLocale
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: self)
    }

    var isPast: Bool {
        self < Date()
    }

    var isToday: Bool {
        Calendar.current.isDateInToday(self)
    }

    var isTomorrow: Bool {
        Calendar.current.isDateInTomorrow(self)
    }

    var startOfDay: Date {
        Calendar.current.startOfDay(for: self)
    }

    var dayOfWeek: Int {
        Calendar.current.component(.weekday, from: self) - 1
    }

    var hourOfDay: Int {
        Calendar.current.component(.hour, from: self)
    }

    func addingDays(_ days: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: days, to: self) ?? self
    }

    func addingWeeks(_ weeks: Int) -> Date {
        Calendar.current.date(byAdding: .weekOfYear, value: weeks, to: self) ?? self
    }

    func addingMonths(_ months: Int) -> Date {
        Calendar.current.date(byAdding: .month, value: months, to: self) ?? self
    }

    func isSameDay(as other: Date) -> Bool {
        Calendar.current.isDate(self, inSameDayAs: other)
    }

    func daysUntil(_ other: Date) -> Int {
        let calendar = Calendar.current
        let start = calendar.startOfDay(for: self)
        let end = calendar.startOfDay(for: other)
        return calendar.dateComponents([.day], from: start, to: end).day ?? 0
    }

    var dateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: self)
    }
}
