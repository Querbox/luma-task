import Foundation

struct ParsedTaskResult {
    let title: String
    let date: Date?
    let time: String?
    let recurrence: TaskRecurrence?
    let icon: String?
    let tags: [String]
}

final class TaskParser {
    private let normalizer = TextNormalizer()
    private let recurrenceParser = RecurrenceParser()
    private let dateParser = DateParser()
    private let timeParser = TimeParser()
    private let titleCleaner = TitleCleaner()
    private let tagExtractor = TagExtractor()
    private let iconMapper = IconMapper()

    func parse(_ input: String) -> ParsedTaskResult {
        // Step 1: Normalize
        var text = normalizer.normalize(input)
        var date: Date? = nil
        var hours: Int? = nil
        var minutes: Int? = nil

        // Step 2: Parse recurrence
        let (recurrence, afterRecurrence) = recurrenceParser.parse(text)
        text = afterRecurrence

        // Step 3: Parse date (relative first)
        let (relativeDate, afterRelative) = dateParser.parseRelativeDate(text)
        if relativeDate != nil {
            date = relativeDate
            text = afterRelative
        }

        // Try weekday if no relative date found
        if date == nil {
            let (weekdayDate, afterWeekday) = dateParser.parseWeekdayDate(text)
            if weekdayDate != nil {
                date = weekdayDate
                text = afterWeekday
            }
        }

        // Step 4: Parse time
        let timeResult = timeParser.parse(text)
        if let h = timeResult.hours {
            hours = h
            minutes = timeResult.minutes ?? 0
            text = timeResult.remaining
        }

        // Apply time to date
        if let d = date, let h = hours {
            date = timeParser.applyTime(to: d, hours: h, minutes: minutes ?? 0)
        } else if let d = date, hours == nil {
            // Default morning time if date but no time
            date = timeParser.applyTime(to: d, hours: 9, minutes: 0)
        }

        // Step 5: Extract metadata from original input
        let tags = tagExtractor.extract(from: input)
        let icon = iconMapper.icon(for: input)

        // Step 6: Clean title
        let title = titleCleaner.clean(text)

        // Format time for display
        var timeStr: String? = nil
        if let h = hours, let m = minutes {
            timeStr = String(format: "%02d:%02d", h, m)
        }

        return ParsedTaskResult(
            title: title,
            date: date,
            time: timeStr,
            recurrence: recurrence,
            icon: icon,
            tags: tags
        )
    }
}
