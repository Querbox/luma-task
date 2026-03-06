import Foundation
import SwiftData
import SwiftUI

@Observable
final class TaskListViewModel {
    private let learningEngine: LearningEngine
    private let parser = TaskParser()

    init(learningEngine: LearningEngine = LearningEngine()) {
        self.learningEngine = learningEngine
    }

    // MARK: - Task Grouping

    func todayTasks(from tasks: [LumaTask]) -> [LumaTask] {
        tasks.filter { task in
            guard !task.isCompleted else { return false }
            guard let dueDate = task.dueDate else { return true } // No date → today
            return dueDate.startOfDay <= Date().startOfDay // Today or past
        }
        .sorted { sortTask($0, before: $1) }
    }

    func soonTasks(from tasks: [LumaTask]) -> [LumaTask] {
        let today = Date().startOfDay
        let weekFromNow = today.addingDays(7)

        return tasks.filter { task in
            guard !task.isCompleted, let dueDate = task.dueDate else { return false }
            let due = dueDate.startOfDay
            return due > today && due <= weekFromNow
        }
        .sorted { sortTask($0, before: $1) }
    }

    func laterTasks(from tasks: [LumaTask]) -> [LumaTask] {
        let weekFromNow = Date().startOfDay.addingDays(7)

        return tasks.filter { task in
            guard !task.isCompleted, let dueDate = task.dueDate else { return false }
            return dueDate.startOfDay > weekFromNow
        }
        .sorted { sortTask($0, before: $1) }
    }

    // MARK: - Task Actions

    func createTask(from input: String, context: ModelContext) -> LumaTask {
        let parsed = parser.parse(input)

        let task = LumaTask(
            content: input,
            title: parsed.title,
            dueDate: parsed.date,
            recurrence: parsed.recurrence,
            icon: parsed.icon,
            tags: parsed.tags
        )

        context.insert(task)

        learningEngine.recordEvent(TaskEvent(
            taskId: task.id,
            title: task.title,
            type: .created,
            metadata: TaskEventMetadata(dayOfWeek: Date().dayOfWeek)
        ))

        return task
    }

    func toggleTask(_ task: LumaTask) {
        task.isCompleted.toggle()

        if task.isCompleted {
            task.completedAt = Date()
            learningEngine.recordEvent(TaskEvent(
                taskId: task.id,
                title: task.title,
                type: .completed,
                completedAt: Date(),
                metadata: TaskEventMetadata(
                    dayOfWeek: Date().dayOfWeek,
                    hourOfCompletion: Date().hourOfDay
                )
            ))
        } else {
            task.completedAt = nil
        }
    }

    func deleteTask(_ task: LumaTask, context: ModelContext) {
        NotificationService.shared.cancelNotifications(for: task.id)
        context.delete(task)
    }

    // MARK: - Parsing Preview

    func parsePreview(_ input: String) -> ParsedTaskResult {
        parser.parse(input)
    }

    // MARK: - Suggestions

    func getSuggestion(for tasks: [LumaTask]) -> TaskSuggestion? {
        for task in tasks where !task.isCompleted {
            let suggestions = learningEngine.getSuggestions(for: task)
            if let suggestion = suggestions.first {
                return suggestion
            }
        }
        return nil
    }

    // MARK: - Private

    private func sortTask(_ a: LumaTask, before b: LumaTask) -> Bool {
        // Completed tasks go to bottom
        if a.isCompleted != b.isCompleted { return !a.isCompleted }
        // Then sort by due date
        let dateA = a.dueDate ?? .distantFuture
        let dateB = b.dueDate ?? .distantFuture
        return dateA < dateB
    }
}
