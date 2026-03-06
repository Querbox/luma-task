import SwiftUI
import SwiftData

struct HeatmapView: View {
    @Query private var allTasks: [LumaTask]
    @State private var viewModel = HeatmapViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: LumaSpacing.xl) {
                    // Stats cards
                    HStack(spacing: LumaSpacing.md) {
                        StatCard(
                            title: "Erledigt",
                            value: "\(viewModel.totalCompleted(from: allTasks))",
                            icon: "checkmark.circle.fill",
                            color: .lumaHeatmapRed
                        )

                        StatCard(
                            title: "Serie",
                            value: "\(viewModel.currentStreak(from: allTasks))",
                            icon: "flame.fill",
                            color: .lumaWarning
                        )
                    }
                    .padding(.horizontal, LumaSpacing.lg)

                    // Contribution graph
                    VStack(alignment: .leading, spacing: LumaSpacing.sm) {
                        Text("Aktivität")
                            .font(.lumaSection)
                            .padding(.horizontal, LumaSpacing.lg)

                        contributionGraph
                    }

                    // Top activities
                    let activities = viewModel.topActivities(from: allTasks)
                    if !activities.isEmpty {
                        VStack(alignment: .leading, spacing: LumaSpacing.md) {
                            Text("Häufigste Aktivitäten")
                                .font(.lumaSection)
                                .padding(.horizontal, LumaSpacing.lg)

                            ForEach(activities, id: \.emoji) { activity in
                                HStack(spacing: LumaSpacing.md) {
                                    Text(activity.emoji)
                                        .font(.system(size: 24))

                                    Text("\(activity.count)×")
                                        .font(.lumaBody)
                                        .foregroundStyle(.secondary)

                                    Spacer()
                                }
                                .padding(.horizontal, LumaSpacing.lg)
                                .padding(.vertical, LumaSpacing.sm)
                                .glassBackground(cornerRadius: LumaRadius.sm)
                                .padding(.horizontal, LumaSpacing.lg)
                            }
                        }
                    }
                }
                .padding(.top, LumaSpacing.sm)
            }
            .navigationTitle("Aktivität")
        }
    }

    // MARK: - Contribution Graph

    @ViewBuilder
    private var contributionGraph: some View {
        let data = viewModel.contributionData(from: allTasks)
        let weeks = viewModel.weeks()

        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 2) {
                ForEach(Array(weeks.enumerated()), id: \.offset) { _, week in
                    VStack(spacing: 2) {
                        ForEach(Array(week.enumerated()), id: \.offset) { _, date in
                            if let date {
                                let count = data[date.dateString] ?? 0
                                let intensity = viewModel.intensity(for: count)
                                RoundedRectangle(cornerRadius: 2, style: .continuous)
                                    .fill(intensityColor(intensity))
                                    .frame(width: 12, height: 12)
                            } else {
                                Color.clear.frame(width: 12, height: 12)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, LumaSpacing.lg)
        }
    }

    private func intensityColor(_ level: Int) -> Color {
        switch level {
        case 0: return Color(.systemGray5)
        case 1: return .lumaSuccess.opacity(0.3)
        case 2: return .lumaSuccess.opacity(0.5)
        case 3: return .lumaSuccess.opacity(0.7)
        default: return .lumaSuccess
        }
    }
}

// MARK: - Stat Card

private struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: LumaSpacing.sm) {
            HStack {
                Image(systemName: icon)
                    .foregroundStyle(color)
                    .font(.system(size: 20))
                Spacer()
            }

            Text(value)
                .font(.system(size: 34, weight: .bold, design: .rounded))
                .foregroundStyle(.primary)

            Text(title)
                .font(.lumaSmall)
                .foregroundStyle(.secondary)
        }
        .padding(LumaSpacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassBackground(cornerRadius: LumaRadius.lg)
    }
}
