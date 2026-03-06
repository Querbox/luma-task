import SwiftUI
import SwiftData

@main
struct LumaTaskApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: LumaTask.self)
    }
}
