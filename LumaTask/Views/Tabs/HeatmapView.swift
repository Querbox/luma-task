import SwiftUI
import SwiftData

struct HeatmapView: View {
    @Query private var allTasks: [LumaTask]
    @State private var viewModel = HeatmapViewModel()
    @State private var appeared = false

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
                        .offset(y: appeared ? 0 : 20)
                        .opacity(appeared ? 1 : 0)

                        StatCard(
                            title: "Serie",
                            value: "\(viewModel.currentStreak(from: allTasks))",
                            icon: "flame.fill",
                            color: .lumaWarning
                        )
                        .offset(y: appeared ? 0 : 20)
                        .opacity(appeared ? 1 : 0)
                    }
                    .padding(.horizontal, LumaSpacing.lg)

                    // Contribution graph
                    VStack(alignment: .leading, spacing: LumaSpacing.sm) {
                        Text("Aktivität")
                            .font(.lumaSection)
                            .padding(.horizontal, LumaSpacing.lg)

                        contributionGraph
                    }
                    .offset(y: appeared ? 0 : 30)
                    .opacity(appeared ? 1 : 0)

                    // Top activities
                    let activities = viewModel.topActivities(from: allTasks)
                    if !activities.isEmpty {
                        VStack(alignment: .leading, spacing: LumaSpacing.md) {
                            Text("Häufigste Aktivitäten")
                                .font(.lumaSection)
                                .padding(.horizontal, LumaSpacing.lg)

                            ForEach(Array(activities.enumerated()), id: \.element.emoji) { index, activity in
                                HStack(spacing: LumaSpacing.md) {
                                    Text(activity.emoji)
                                        .font(.system(size: 24))

                                    Text("×\(activity.count)")
                                        .font(.lumaBody)
                                        .foregroundStyle(.secondary)
                                        .contentTransition(.numericText())

                                    Spacer()
                                }
                                .padding(.horizontal, LumaSpacing.lg)
                                .padding(.vertical, LumaSpacing.sm)
                                .glassBackground(cornerRadius: LumaRadius.sm)
                                .padding(.horizontal, LumaSpacing.lg)
                                .offset(y: appeared ? 0 : 20)
                                .opacity(appeared ? 1 : 0)
                                .animation(
                                    .spring(response: 0.5, dampingFraction: 0.8).delay(Double(index) * 0.05 + 0.3),
                                    value: appeared
                                )
                            }
                        }
                    }
                }
                .padding(.top, LumaSpacing.sm)
            }
            .navigationTitle("Aktivität")
        }
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                appeared = true
            }
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
                    .symbolEffect(.pulse.wholeSymbol, options: .repeating.speed(0.3), isActive: true)
                Spacer()
            }

            Text(value)
                .font(.system(size: 34, weight: .bold, design: .rounded))
                .foregroundStyle(.primary)
                .contentTransition(.numericText())

            Text(title)
                .font(.lumaSmall)
                .foregroundStyle(.secondary)
        }
        .padding(LumaSpacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassBackground(cornerRadius: LumaRadius.lg)
    }
}
