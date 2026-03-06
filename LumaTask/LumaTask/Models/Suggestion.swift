import Foundation

enum SuggestionType: String {
    case recurringWeekly = "recurring_weekly"
    case setTime = "set_time"
    case adjustDate = "adjust_date"
    case dailyHabit = "daily_habit"
}

struct TaskSuggestion: Identifiable {
    let id = UUID()
    let type: SuggestionType
    let taskId: UUID
    let message: String
    let actionLabel: String
    let confidence: Double
}
