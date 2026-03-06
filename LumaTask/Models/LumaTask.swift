import Foundation
import SwiftData

@Model
final class LumaTask {
    @Attribute(.unique) var id: UUID
    var content: String
    var title: String
    var dueDate: Date?
    var isCompleted: Bool
    var recurrence: TaskRecurrence?
    var createdAt: Date
    var completedAt: Date?
    var postponedCount: Int
    var originalDueDate: Date?
    var icon: String?
    var tags: [String]
    var hasReminder: Bool
    var reminderDate: Date?

    init(
        content: String,
        title: String,
        dueDate: Date? = nil,
        recurrence: TaskRecurrence? = nil,
        icon: String? = nil,
        tags: [String] = [],
        hasReminder: Bool = false,
        reminderDate: Date? = nil
    ) {
        self.id = UUID()
        self.content = content
        self.title = title
        self.dueDate = dueDate
        self.isCompleted = false
        self.recurrence = recurrence
        self.createdAt = Date()
        self.completedAt = nil
        self.postponedCount = 0
        self.originalDueDate = dueDate
        self.icon = icon
        self.tags = tags
        self.hasReminder = hasReminder
        self.reminderDate = reminderDate
    }
}
