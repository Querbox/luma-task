import Foundation

struct TagExtractor {
    private let keywords: [String: String] = [
        "frühstück": "Frühstück", "fruehstueck": "Frühstück", "breakfast": "Frühstück",
        "mittag": "Mittagessen", "lunch": "Mittagessen",
        "abendessen": "Abendessen", "dinner": "Abendessen",
        "gym": "Fitness", "fitness": "Fitness", "sport": "Fitness", "training": "Fitness",
        "termin": "Termin", "appointment": "Termin", "meeting": "Termin",
        "arbeit": "Arbeit", "work": "Arbeit",
        "hausaufgaben": "Lernen", "lernen": "Lernen", "study": "Lernen",
        "einkaufen": "Einkauf", "shopping": "Einkauf"
    ]

    func extract(from input: String) -> [String] {
        let lower = input.lowercased()
        var tags = Set<String>()
        for (key, tag) in keywords {
            if lower.contains(key) {
                tags.insert(tag)
            }
        }
        return Array(tags).sorted()
    }
}
