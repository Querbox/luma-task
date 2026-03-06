# Luma Task (iOS)

Native Swift iOS App — Task-Management mit iOS 26 Liquid Glass Design.

## Plattform

- **iOS 26+**, Swift 6, SwiftUI, SwiftData
- Keine externen Dependencies — alles nativ

## Projekt öffnen

1. Repo clonen
2. In Xcode: **File → New Project → iOS App** (SwiftUI, SwiftData)
3. Projektname: `LumaTask`, Bundle ID wählen
4. Alle Dateien aus dem `LumaTask/` Ordner in das Xcode-Projekt ziehen
5. Build & Run (iOS 26 Simulator oder Gerät)

## Architektur (MVVM)

```
LumaTask/
  LumaTaskApp.swift           # @main Entry Point
  ContentView.swift            # TabView (4 Tabs)

  Models/                      # SwiftData @Model Entities
  Services/                    # Business Logic
    NLP/                       # Deutsche NLP-Parser Pipeline
  ViewModels/                  # @Observable ViewModels
  Views/
    Tabs/                      # 4 Haupt-Screens
    Components/                # Feature-Komponenten
    Shared/                    # Wiederverwendbare UI
  DesignSystem/                # Farben, Typography, Glass
  Extensions/                  # Date, String Helfer
  Resources/                   # Assets.xcassets
```

## Key Patterns

- **Glass Design**: `GlassModifier` mit iOS 26 `.glassEffect()` API + Material-Fallback
- **SwiftData**: `@Model` für Persistenz, `@Query` für reaktive Daten
- **NLP Pipeline**: TextNormalizer → DateParser → TimeParser → RecurrenceParser → TitleCleaner → TagExtractor → IconMapper
- **Sprache**: Deutsch (primär), Englisch (Datums-Parsing)

## Conventions

- Swift 6 strict concurrency
- `@Observable` für ViewModels (nicht ObservableObject)
- Deutsche UI-Strings, deutsche Variablennamen nur wo sinnvoll
- Keine externen Packages
