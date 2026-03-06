import Foundation

struct RegexMatch {
    let fullMatch: String
    private let groups: [String?]

    init(result: NSTextCheckingResult, in string: String) {
        let nsString = string as NSString
        self.fullMatch = nsString.substring(with: result.range)

        var groups: [String?] = []
        for i in 0..<result.numberOfRanges {
            let range = result.range(at: i)
            if range.location != NSNotFound {
                groups.append(nsString.substring(with: range))
            } else {
                groups.append(nil)
            }
        }
        self.groups = groups
    }

    func group(_ index: Int) -> String? {
        guard index < groups.count else { return nil }
        return groups[index]
    }
}

extension String {
    func firstMatch(for pattern: String) -> RegexMatch? {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) else {
            return nil
        }
        let range = NSRange(self.startIndex..., in: self)
        guard let result = regex.firstMatch(in: self, range: range) else {
            return nil
        }
        return RegexMatch(result: result, in: self)
    }

    func matches(pattern: String) -> Bool {
        range(of: pattern, options: [.regularExpression, .caseInsensitive]) != nil
    }
}
