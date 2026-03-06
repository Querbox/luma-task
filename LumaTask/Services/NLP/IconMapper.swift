import Foundation

struct IconMapper {
    private let iconMap: [(keyword: String, icon: String)] = [
        ("gym", "🏋️"), ("sport", "🏃"), ("yoga", "🧘"),
        ("kochen", "🍳"), ("essen", "🍴"),
        ("einkaufen", "🛒"), ("arbeit", "💼"), ("meeting", "📅"),
        ("anruf", "📞"), ("lesen", "📚"), ("code", "💻"),
        ("putzen", "🧹"), ("schlafen", "😴"),
        ("arzt", "🏥"), ("geld", "💰"), ("auto", "🚗"),
        ("party", "🎉"), ("idee", "💡")
    ]

    func icon(for input: String) -> String? {
        let lower = input.lowercased()
        for entry in iconMap {
            if lower.contains(entry.keyword) {
                return entry.icon
            }
        }
        return nil
    }
}
