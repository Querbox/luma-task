import Foundation
import SwiftData

struct ExportableTask: Codable {
    let id: String
    let content: String
    let title: String
    let dueDate: Double?
    let isCompleted: Bool
    let recurrence: TaskRecurrence?
    let createdAt: Double
    let completedAt: Double?
    let postponedCount: Int
    let originalDueDate: Double?
    let icon: String?
    let tags: [String]?
    let hasReminder: Bool?
    let reminderDate: Double?
    let priority: Int?
    let notes: String?

    init(from task: LumaTask) {
        self.id = task.id.uuidString
        self.content = task.content
        self.title = task.title
        self.dueDate = task.dueDate?.timeIntervalSince1970.milliseconds
        self.isCompleted = task.isCompleted
        self.recurrence = task.recurrence
        self.createdAt = task.createdAt.timeIntervalSince1970.milliseconds
        self.completedAt = task.completedAt?.timeIntervalSince1970.milliseconds
        self.postponedCount = task.postponedCount
        self.originalDueDate = task.originalDueDate?.timeIntervalSince1970.milliseconds
        self.icon = task.icon
        self.tags = task.tags
        self.hasReminder = task.hasReminder
        self.reminderDate = task.reminderDate?.timeIntervalSince1970.milliseconds
        self.priority = task.priority
        self.notes = task.notes.isEmpty ? nil : task.notes
    }

    func toLumaTask() -> LumaTask {
        let task = LumaTask(
            content: content,
            title: title,
            dueDate: dueDate.map { Date(timeIntervalSince1970: $0 / 1000) },
            recurrence: recurrence,
            icon: icon,
            tags: tags ?? [],
            hasReminder: hasReminder ?? false,
            reminderDate: reminderDate.map { Date(timeIntervalSince1970: $0 / 1000) }
        )
        // Override auto-generated values
        if let uuid = UUID(uuidString: id) {
            task.id = uuid
        }
        task.isCompleted = isCompleted
        task.createdAt = Date(timeIntervalSince1970: createdAt / 1000)
        task.completedAt = completedAt.map { Date(timeIntervalSince1970: $0 / 1000) }
        task.postponedCount = postponedCount
        task.originalDueDate = originalDueDate.map { Date(timeIntervalSince1970: $0 / 1000) }
        task.priority = priority ?? 0
        task.notes = notes ?? ""
        return task
    }
}

private extension TimeInterval {
    var milliseconds: Double { self * 1000 }
}

struct ExportImportService {
    func exportToJSON(tasks: [LumaTask]) throws -> Data {
        let exportable = tasks.map { ExportableTask(from: $0) }
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return try encoder.encode(exportable)
    }

    func importFromJSON(data: Data, into context: ModelContext) throws {
        let decoder = JSONDecoder()
        let imported = try decoder.decode([ExportableTask].self, from: data)

        for exportable in imported {
            let task = exportable.toLumaTask()
            context.insert(task)
        }

        try context.save()
    }

    func exportToTemporaryFile(tasks: [LumaTask]) throws -> URL {
        let data = try exportToJSON(tasks: tasks)
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd_HH-mm"
        let timestamp = formatter.string(from: Date())
        let filename = "luma-task-backup-\(timestamp).json"

        let tempDir = FileManager.default.temporaryDirectory
        let fileURL = tempDir.appendingPathComponent(filename)
        try data.write(to: fileURL)
        return fileURL
    }
}
