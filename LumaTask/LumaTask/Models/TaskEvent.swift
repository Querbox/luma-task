import Foundation

enum TaskEventType: String, Codable {
    case created
    case completed
    case postponed
    case edited
}

struct TaskEventMetadata: Codable {
    var dayOfWeek: Int?
    var hourOfCompletion: Int?
    var postponeCount: Int?
}

struct TaskEvent: Codable, Identifiable {
    let id: UUID
    let taskId: UUID
    let title: String
    let type: TaskEventType
    let timestamp: Date
    var completedAt: Date?
    var originalDueDate: Date?
    var newDueDate: Date?
    var metadata: TaskEventMetadata?

    init(
        taskId: UUID,
        title: String,
        type: TaskEventType,
        completedAt: Date? = nil,
        originalDueDate: Date? = nil,
        newDueDate: Date? = nil,
        metadata: TaskEventMetadata? = nil
    ) {
        self.id = UUID()
        self.taskId = taskId
        self.title = title
        self.type = type
        self.timestamp = Date()
        self.completedAt = completedAt
        self.originalDueDate = originalDueDate
        self.newDueDate = newDueDate
        self.metadata = metadata
    }
}
