# Lernify — Offline-PWA

Eine Lern-App, die **nur** deine eigenen Schuldokumente als Wissensgrundlage nutzt:
Lernzettel, Karteikarten und Aufgaben werden ausschließlich aus dem erstellt, was du
tatsächlich hochgeladen hast — keine abweichenden Methoden oder Begriffe aus dem Netz.

## Was ist enthalten

| Datei | Zweck |
|---|---|
| `index.html` | Die App selbst |
| `manifest.json` | Macht die App installierbar (Icon, Name, Standalone-Fenster) |
| `service-worker.js` | Cacht die App fürs Offline-Arbeiten |
| `icons/` | App-Icons in drei Größen |

## Schnellstart (lokal testen)

Service Worker & Installation funktionieren aus Sicherheitsgründen **nicht**, wenn du
`index.html` einfach per Doppelklick öffnest (`file://`). Du brauchst einen simplen
lokalen Server — beides unten funktioniert:

```bash
# Variante A: Python (fast überall vorinstalliert)
cd lernify-pwa
python3 -m http.server 8000

# Variante B: Node.js
npx serve .
```

Danach im Browser öffnen: **http://localhost:8000**

## Dauerhaft installieren (auf Handy oder PC)

Für eine "echte" Installation (Icon auf dem Homescreen, eigenes Fenster) braucht es
`https://`. Zwei kostenlose Wege, jeweils ca. 2 Minuten:

- **Netlify Drop** — [app.netlify.com/drop](https://app.netlify.com/drop): den `lernify-pwa`-Ordner
  reinziehen, du bekommst sofort eine echte `https://...`-URL.
- **GitHub Pages** — Ordnerinhalt in ein GitHub-Repo pushen, unter
  *Settings → Pages* aktivieren.

Danach die URL auf dem Handy/PC öffnen und im Browser-Menü **"Zum Startbildschirm
hinzufügen"** bzw. **"App installieren"** wählen.

## Einrichtung: API-Key

Die KI-Funktionen (Lernzettel, Karteikarten, Aufgaben, Themensuche) rufen Anthropics
Claude-API **direkt aus deinem Browser** auf — ohne Server dazwischen. Dafür brauchst
du einen eigenen API-Key:

1. Key erstellen unter [console.anthropic.com](https://console.anthropic.com)
2. In der App oben rechts auf **"⚙ API-Key"** klicken
3. Key einfügen und speichern

Der Key wird **ausschließlich lokal** in deinem Browser gespeichert (IndexedDB) und
geht nirgendwo anders hin als direkt an `api.anthropic.com`. Ohne Key funktionieren
Hochladen, Bibliotheken und Verwaltung trotzdem — nur die KI-Funktionen brauchen ihn.

**Kosten:** Die API wird nach Verbrauch abgerechnet (nicht Teil eines Claude.ai-Abos).
Für den Umfang dieser App (kurze Zusammenfassungen/Karteikarten) sind das üblicherweise
Cent-Beträge pro Nutzung — Details siehe [anthropic.com/pricing](https://www.anthropic.com/pricing).

## Was offline funktioniert — und was nicht

| Funktion | Offline? |
|---|---|
| Bereits gespeicherte Dokumente ansehen | ✅ Ja |
| Bibliotheken durchklicken/verwalten | ✅ Ja |
| Neue PDFs hochladen (Texterkennung) | ⚠️ Nur wenn pdf.js schon einmal geladen/gecacht wurde |
| Lernzettel/Karteikarten/Aufgaben erzeugen | ❌ Nein, braucht Internet + API-Key |
| Themensuche über alle Dokumente | ❌ Nein, braucht Internet + API-Key |

## Deine Daten

Alles (Dokumente, Bibliotheken, generierte Inhalte, API-Key) liegt **nur** in der
IndexedDB-Datenbank deines Browsers auf diesem Gerät. Nichts wird an einen eigenen
Server geschickt. Das bedeutet aber auch:

- Kein automatischer Sync zwischen Geräten/Browsern
- Löschst du die Browserdaten dieser Seite, sind auch deine Dokumente weg
- Ein eigenes Backup (z. B. regelmäßig Originale exportieren) ist empfehlenswert

## Bekannte Einschränkungen

- "Ganzen Ordner auswählen" funktioniert nur in Chrome/Edge (Firefox/Safari unterstützen
  das nicht).
- Gescannte PDFs ohne echte Text-Ebene können nicht ausgelesen werden — Text stattdessen
  manuell einfügen.
- Sehr große PDFs werden aus Speicherplatzgründen automatisch gekürzt (mit Hinweis in
  der App).
