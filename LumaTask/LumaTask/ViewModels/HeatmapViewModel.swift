import Foundation

@Observable
final class HeatmapViewModel {
    func contributionData(from tasks: [LumaTask]) -> [String: Int] {
        var data: [String: Int] = [:]
        for task in tasks where task.isCompleted {
            if let completedAt = task.completedAt {
                let key = completedAt.dateString
                data[key, default: 0] += 1
            }
        }
        return data
    }

    func totalCompleted(from tasks: [LumaTask]) -> Int {
        tasks.filter(\.isCompleted).count
    }

    func currentStreak(from tasks: [LumaTask]) -> Int {
        let data = contributionData(from: tasks)
        var streak = 0
        var date = Date()

        // Allow today to be empty
        let todayKey = date.dateString
        if data[todayKey] == nil {
            date = date.addingDays(-1)
        }

        while true {
            let key = date.dateString
            if let count = data[key], count > 0 {
                streak += 1
                date = date.addingDays(-1)
            } else {
                break
            }
        }

        return streak
    }

    func topActivities(from tasks: [LumaTask]) -> [(emoji: String, count: Int)] {
        var counts: [String: Int] = [:]
        for task in tasks where task.isCompleted {
            if let icon = task.icon {
                counts[icon, default: 0] += 1
            }
        }
        return counts
            .map { (emoji: $0.key, count: $0.value) }
            .sorted { $0.count > $1.count }
            .prefix(5)
            .map { $0 }
    }

    func intensity(for count: Int) -> Int {
        switch count {
        case 0: return 0
        case 1: return 1
        case 2: return 2
        case 3: return 3
        default: return 4
        }
    }

    func weeks() -> [[Date?]] {
        let today = Date()
        let calendar = Calendar.current

        // Start 364 days ago (52 weeks)
        guard let startDate = calendar.date(byAdding: .day, value: -364, to: today) else { return [] }

        // Adjust to start on Monday
        var weekday = calendar.component(.weekday, from: startDate)
        weekday = (weekday + 5) % 7 // Convert to Monday-first
        let adjustedStart = startDate.addingDays(-weekday)

        var weeks: [[Date?]] = []
        var currentDate = adjustedStart

        while currentDate <= today {
            var week: [Date?] = []
            for _ in 0..<7 {
                if currentDate <= today {
                    week.append(currentDate)
                } else {
                    week.append(nil)
                }
                currentDate = currentDate.addingDays(1)
            }
            weeks.append(week)
        }

        return weeks
    }
}
