# Luma Task

Native iOS Task-Management App mit iOS 26 Liquid Glass Design.

## Features

- NLP-basierte Aufgabenerstellung (Deutsch/Englisch)
- Kalenderansicht mit Monatsnavigation
- Aktivitäts-Heatmap mit Streak-Tracking
- Wiederkehrende Aufgaben (täglich, wöchentlich, monatlich, etc.)
- Lokale Benachrichtigungen für Erinnerungen
- JSON Backup Export/Import
- Lernende Vorschläge basierend auf Nutzungsmuster

## Setup

1. Repository clonen
2. In Xcode: **File → New Project → iOS App**
   - Interface: SwiftUI
   - Storage: SwiftData
   - Projektname: `LumaTask`
3. Die generierten Dateien (`ContentView.swift`, `Item.swift`, etc.) löschen
4. Den `LumaTask/` Ordner aus diesem Repo ins Xcode-Projekt ziehen
5. Build Target: iOS 26+
6. Build & Run

## Technologie

- Swift 6 / SwiftUI
- SwiftData (Persistenz)
- iOS 26 Liquid Glass APIs
- Keine externen Dependencies
