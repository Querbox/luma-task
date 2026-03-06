import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(ToastManager.self) private var toastManager
    @Query private var allTasks: [LumaTask]

    @State private var showImporter = false
    @State private var exportURL: URL?
    @State private var showShareSheet = false
    @State private var notificationPermission = false

    private let exportImportService = ExportImportService()

    var body: some View {
        NavigationStack {
            List {
                // Notifications
                Section {
                    HStack {
                        Label("Benachrichtigungen", systemImage: "bell.badge")
                        Spacer()
                        if notificationPermission {
                            Text("Aktiv")
                                .font(.lumaSmall)
                                .foregroundStyle(.lumaSuccess)
                        } else {
                            Button("Aktivieren") {
                                Task {
                                    notificationPermission = await NotificationService.shared.requestAuthorization()
                                }
                            }
                            .font(.lumaSmall)
                        }
                    }
                } header: {
                    Text("Datenschutz & Benachrichtigungen")
                }

                // Backup
                Section {
                    Button {
                        exportTasks()
                    } label: {
                        Label("Backup erstellen", systemImage: "square.and.arrow.up")
                    }

                    Button {
                        showImporter = true
                    } label: {
                        Label("Backup importieren", systemImage: "square.and.arrow.down")
                    }
                } header: {
                    Text("Backup")
                }

                // Info
                Section {
                    HStack {
                        Text("Aufgaben")
                        Spacer()
                        Text("\(allTasks.count)")
                            .foregroundStyle(.secondary)
                    }

                    HStack {
                        Text("Erledigt")
                        Spacer()
                        Text("\(allTasks.filter(\.isCompleted).count)")
                            .foregroundStyle(.secondary)
                    }
                } header: {
                    Text("Statistik")
                }

                // More
                Section {
                    HStack {
                        Label("Cloud Sync", systemImage: "icloud")
                        Spacer()
                        Text("Bald verfügbar")
                            .font(.lumaSmall)
                            .foregroundStyle(.tertiary)
                    }
                } header: {
                    Text("Mehr")
                }

                // Version
                Section {
                    HStack {
                        Spacer()
                        Text("Luma Task v2.0.0 ❤️")
                            .font(.lumaSmall)
                            .foregroundStyle(.tertiary)
                        Spacer()
                    }
                }
                .listRowBackground(Color.clear)
            }
            .navigationTitle("Einstellungen")
            .fileImporter(
                isPresented: $showImporter,
                allowedContentTypes: [.json],
                allowsMultipleSelection: false
            ) { result in
                importTasks(result: result)
            }
            .sheet(isPresented: $showShareSheet) {
                if let url = exportURL {
                    ShareSheet(url: url)
                }
            }
            .task {
                notificationPermission = await NotificationService.shared.isAuthorized
            }
        }
    }

    // MARK: - Export/Import

    private func exportTasks() {
        do {
            let url = try exportImportService.exportToTemporaryFile(tasks: allTasks)
            exportURL = url
            showShareSheet = true
            HapticService.shared.success()
            toastManager.show("Backup erstellt", type: .success)
        } catch {
            toastManager.show("Export fehlgeschlagen", type: .error)
        }
    }

    private func importTasks(result: Result<[URL], Error>) {
        switch result {
        case .success(let urls):
            guard let url = urls.first else { return }
            guard url.startAccessingSecurityScopedResource() else { return }
            defer { url.stopAccessingSecurityScopedResource() }

            do {
                let data = try Data(contentsOf: url)
                try exportImportService.importFromJSON(data: data, into: modelContext)
                HapticService.shared.success()
                toastManager.show("Backup importiert", type: .success)
            } catch {
                toastManager.show("Import fehlgeschlagen", type: .error)
            }

        case .failure:
            toastManager.show("Datei konnte nicht gelesen werden", type: .error)
        }
    }
}

// MARK: - Share Sheet

struct ShareSheet: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: [url], applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
