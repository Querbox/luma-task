import Foundation

struct TaskPattern {
    var title: String
    var normalizedTitle: String
    var occurrences: Int
    var completionTimes: [Int]
    var weekdays: Set<Int>
    var postponeCount: Int
    var lastSeen: Date
}
