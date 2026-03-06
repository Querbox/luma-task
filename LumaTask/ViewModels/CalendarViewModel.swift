import Foundation
import SwiftUI

@MainActor
@Observable
final class CalendarViewModel {
    var currentMonth: Date = Date()
    var selectedDate: Date = Date()

    private let calendar = Calendar.current

    var monthTitle: String {
        currentMonth.formattedMonthYear.capitalized
    }

    func nextMonth() {
        currentMonth = currentMonth.addingMonths(1)
        HapticService.shared.light()
    }

    func previousMonth() {
        currentMonth = currentMonth.addingMonths(-1)
        HapticService.shared.light()
    }

    func selectDate(_ date: Date) {
        selectedDate = date
        HapticService.shared.light()
    }

    func tasksForDay(_ date: Date, from tasks: [LumaTask]) -> [LumaTask] {
        tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return dueDate.isSameDay(as: date)
        }
    }

    func taskCount(for date: Date, from tasks: [LumaTask]) -> Int {
        tasksForDay(date, from: tasks).count
    }

    func daysInMonth() -> [Date?] {
        let range = calendar.range(of: .day, in: .month, for: currentMonth)!
        let firstOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: currentMonth))!

        // Weekday of first day (1 = Sunday in Calendar, we want Monday = 0)
        var firstWeekday = calendar.component(.weekday, from: firstOfMonth)
        // Convert to Monday-first (Mo=0, Di=1, ... So=6)
        firstWeekday = (firstWeekday + 5) % 7

        var days: [Date?] = Array(repeating: nil, count: firstWeekday)

        for day in range {
            if let date = calendar.date(byAdding: .day, value: day - 1, to: firstOfMonth) {
                days.append(date)
            }
        }

        // Pad to complete last week
        while days.count % 7 != 0 {
            days.append(nil)
        }

        return days
    }

    var weekdayLabels: [String] {
        ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    }

    var selectedDateLabel: String {
        if selectedDate.isToday {
            return "Heute"
        }
        return selectedDate.formattedGermanMedium
    }
}
