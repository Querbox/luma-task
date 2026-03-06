import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab("Heute", systemImage: "list.bullet", value: 0) {
                FocusView()
            }

            Tab("Plan", systemImage: "calendar", value: 1) {
                CalendarTabView()
            }

            Tab("Aktivität", systemImage: "chart.bar.fill", value: 2) {
                HeatmapView()
            }

            Tab("Einstellungen", systemImage: "gearshape", value: 3) {
                SettingsView()
            }
        }
        .tint(.lumaAccent)
        .onChange(of: selectedTab) {
            HapticService.shared.light()
        }
    }
}
