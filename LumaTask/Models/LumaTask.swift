import Foundation
import SwiftUI
import SwiftData

// MARK: - Priority

enum TaskPriority: Int, CaseIterable {
    case none = 0
    case low = 1
    case medium = 2
    case high = 3

    var label: String {
        switch self {
        case .none: "Keine"
        case .low: "Niedrig"
        case .medium: "Mittel"
        case .high: "Hoch"
        }
    }

    var color: Color {
        switch self {
        case .none: .secondary
        case .low: .lumaSuccess
        case .medium: .lumaWarning
        case .high: .lumaDanger
        }
    }

    var icon: String {
        switch self {
        case .none: "minus"
        case .low: "arrow.down"
        case .medium: "equal"
        case .high: "exclamationmark"
        }
    }
}

// MARK: - Model

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
    var priority: Int
    var notes: String

    init(
        content: String,
        title: String,
        dueDate: Date? = nil,
        recurrence: TaskRecurrence? = nil,
        icon: String? = nil,
        tags: [String] = [],
        hasReminder: Bool = false,
        reminderDate: Date? = nil,
        priority: Int = 0,
        notes: String = ""
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
        self.priority = priority
        self.notes = notes
    }
}
