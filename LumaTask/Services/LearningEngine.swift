import Foundation

@Observable
final class LearningEngine {
    private var patterns: [String: TaskPattern] = [:]
    private var events: [TaskEvent] = []
    private let maxEvents = 1000

    private var storageURL: URL {
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        let dir = appSupport.appendingPathComponent("LumaTask", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("learning_events.json")
    }

    init() {
        loadFromDisk()
    }

    // MARK: - Public API

    func recordEvent(_ event: TaskEvent) {
        events.append(event)
        if events.count > maxEvents {
            events.removeFirst()
        }
        updatePatterns()
        saveToDisk()
    }

    func getSuggestions(for task: LumaTask) -> [TaskSuggestion] {
        var suggestions: [TaskSuggestion] = []
        guard let pattern = getPattern(for: task.title) else { return suggestions }

        // 1. Weekly recurrence: 3+ times on same weekday
        if pattern.occurrences >= 3 && pattern.weekdays.count == 1 {
            let dayOfWeek = pattern.weekdays.first!
            let days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
            let dayName = dayOfWeek < days.count ? days[dayOfWeek] : "Tag"
            suggestions.append(TaskSuggestion(
                type: .recurringWeekly,
                taskId: task.id,
                message: "\"\(task.title)\" jeden \(dayName) wiederholen?",
                actionLabel: "Wöchentlich setzen",
                confidence: 0.9
            ))
        }

        // 2. Time suggestion: 3+ completions around same time
        if pattern.completionTimes.count >= 3 {
            let avgHour = pattern.completionTimes.reduce(0, +) / pattern.completionTimes.count
            suggestions.append(TaskSuggestion(
                type: .setTime,
                taskId: task.id,
                message: "Standardzeit auf \(String(format: "%02d", avgHour)):00 setzen?",
                actionLabel: "Zeit setzen",
                confidence: 0.8
            ))
        }

        // 3. Frequent postpones
        if pattern.postponeCount >= 3 {
            suggestions.append(TaskSuggestion(
                type: .adjustDate,
                taskId: task.id,
                message: "Diese Aufgabe wird oft verschoben. Ein besseres Datum?",
                actionLabel: "Datum anpassen",
                confidence: 0.7
            ))
        }

        // 4. Daily habit: 7+ events in last 7 days
        let sevenDaysAgo = Date().addingTimeInterval(-7 * 24 * 60 * 60)
        let recentEvents = events.filter { $0.title == task.title && $0.timestamp > sevenDaysAgo }
        if recentEvents.count >= 7 {
            suggestions.append(TaskSuggestion(
                type: .dailyHabit,
                taskId: task.id,
                message: "Das ist eine tägliche Routine. Als täglich festlegen?",
                actionLabel: "Täglich setzen",
                confidence: 0.85
            ))
        }

        suggestions.sort { $0.confidence > $1.confidence }
        return Array(suggestions.prefix(1))
    }

    // MARK: - Private

    private func updatePatterns() {
        var patternMap: [String: TaskPattern] = [:]

        for event in events {
            let normalized = normalizeTitle(event.title)
            var pattern = patternMap[normalized] ?? TaskPattern(
                title: event.title,
                normalizedTitle: normalized,
                occurrences: 0,
                completionTimes: [],
                weekdays: [],
                postponeCount: 0,
                lastSeen: event.timestamp
            )

            if event.timestamp > pattern.lastSeen {
                pattern.lastSeen = event.timestamp
            }

            switch event.type {
            case .created:
                pattern.occurrences += 1
            case .completed:
                if let hour = event.metadata?.hourOfCompletion {
                    pattern.completionTimes.append(hour)
                }
            case .postponed:
                pattern.postponeCount += 1
            case .edited:
                break
            }

            if let dayOfWeek = event.metadata?.dayOfWeek {
                pattern.weekdays.insert(dayOfWeek)
            }

            patternMap[normalized] = pattern
        }

        patterns = patternMap
    }

    private func getPattern(for title: String) -> TaskPattern? {
        let normalized = normalizeTitle(title)

        // Exact match
        if let pattern = patterns[normalized] {
            return pattern
        }

        // Similarity match (threshold: 0.7)
        for (key, pattern) in patterns {
            if calculateSimilarity(normalized, key) > 0.7 {
                return pattern
            }
        }

        return nil
    }

    private func normalizeTitle(_ title: String) -> String {
        title.lowercased()
            .replacingOccurrences(of: "[^\\w\\s]", with: "", options: .regularExpression)
            .replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
            .trimmingCharacters(in: .whitespaces)
    }

    private func calculateSimilarity(_ a: String, _ b: String) -> Double {
        if a == b { return 1.0 }
        let shorter = a.count < b.count ? a : b
        let longer = a.count >= b.count ? a : b
        guard !longer.isEmpty else { return 0.0 }

        var matches = 0
        let shorterChars = Array(shorter)
        let longerChars = Array(longer)

        for i in 0..<shorterChars.count {
            if longerChars[i] == shorterChars[i] {
                matches += 1
            }
        }

        return Double(matches) / Double(longerChars.count)
    }

    // MARK: - Persistence

    private func saveToDisk() {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .secondsSince1970
        guard let data = try? encoder.encode(events) else { return }
        try? data.write(to: storageURL, options: .atomic)
    }

    private func loadFromDisk() {
        guard let data = try? Data(contentsOf: storageURL) else { return }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .secondsSince1970
        guard let loaded = try? decoder.decode([TaskEvent].self, from: data) else { return }
        events = loaded
        updatePatterns()
    }
}
