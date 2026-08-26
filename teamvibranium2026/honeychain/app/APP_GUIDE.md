# HoneyChain Beekeeper App - Complete Guide

> The Flutter mobile app of Team Vibranium's SIH 2026 project (SIH26021, Ministry of MSME).
> Built for **Ravi** - a beekeeper with 8 boxes, a Rs 6,000 Android phone, and no reliable internet.

---

## 1. What this app is

The beekeeper's window into HoneyChain. Ravi logs every harvest from his phone - **even with zero network** - with photo proof and GPS location. When signal returns, the app syncs his batches to the HoneyChain API, where they become immutable blockchain transactions. It speaks **English, Hindi, and Tamil**, uses icon-first UI for low-literacy users, and turns disease alerts and yield forecasts into simple notifications. No passwords, no complex forms - 3 taps per harvest.

## 2. Why offline-first is the whole game

| Reality in villages | Our answer |
|---|---|
| Network disappears for hours | Batches queue in on-device SQLite, survive app kill/reboot |
| Cheap phones, low storage | Single lightweight app, no heavy dependencies |
| Users skip typing | Icon-driven forms + photo evidence instead of text |
| Language barriers | Full en/hi/ta string maps, switchable in Settings |
| Judges will cut the internet | **Airplane-mode demo is a feature, not a failure mode** |

## 3. Screens

```
LoginScreen --> HomeScreen (4 bottom tabs)
                [Hives] [Batches] [Sync] [Settings]
```

| Screen | File | Purpose | Key actions |
|---|---|---|---|
| **Login** | screens/login_screen.dart | Phone entry (demo: any number logs in as Ravi Kumar, beekeeper) | Amber HONEYCHAIN logo, phone field, Enter |
| **Home** | screens/home_screen.dart | Shell with bottom nav + queued-count chip in AppBar | 4 tabs |
| **Hives** | screens/hives_screen.dart | Ravi's box register | List (name, boxes, last inspection) + FAB add-hive dialog |
| **New Harvest** | screens/new_harvest_screen.dart | THE core form | Hive dropdown, weight, flora picker (Mustard/Eucalyptus/Lychee/Sunflower/Wild), camera photo, GPS capture, **SAVE OFFLINE** button |
| **Batches** | screens/batches_screen.dart | Harvest history | StatusChip tiles: orange queued, blue syncing, green synced (+short txHash), red error |
| **Sync** | screens/sync_screen.dart | Manual sync control | Big SYNC NOW button, pending list, last-sync time, airplane-mode hint |
| **Settings** | screens/settings_screen.dart | Language radios (English/Hindi/Tamil), API base URL, logout | Persists via SharedPreferences |

## 4. Architecture - the offline queue

```
New Harvest form save
        |
        v
SQLite (sqflite) table: batches          status = queued
client_batch_id = PRIMARY KEY (generated on phone)
        |
        v  SyncProvider.syncAll()
ApiClient POST /api/batches  {batches:[...]}
        |
        v  server dedupes by client_batch_id
API -> Blockchain -> txHash returned
        |
        v  markSynced(serverId, txHash)
Batch tile turns GREEN with txHash
```

**Conflict safety:** every batch gets a locally-generated client_batch_id before it leaves the phone. If a retry sends the same batch twice, the server's ON CONFLICT DO NOTHING dedupes it - no duplicate blockchain entries, ever.

**Failure safety:** per-batch failure -> status error (red chip), stays queued, retried next sync. One bad batch never blocks the others.

## 5. File map

```
app/
pubspec.yaml        provider, http, sqflite, path, geolocator, image_picker,
                    shared_preferences, intl
lib/
  main.dart         Providers + MaterialApp (seed #B45309) + locale
  models/
    batch.dart      Batch + BatchStatus {queued, syncing, synced, error}
    hive.dart       Hive model
  services/
    db.dart         sqflite openDatabase, CRUD, pendingBatches(), markSynced/Error
    api.dart        ApiClient: baseUrl 10.0.2.2:4000 (emulator loopback),
                    syncBatches() POST with 10s timeout, SyncException
    location.dart   Geolocator wrapper, returns (lat,lng) or null
  providers/
    auth_provider.dart   demo login, SharedPreferences persistence
    sync_provider.dart   syncAll(), progress list, queuedCount
  l10n/strings.dart  en/hi/ta maps, S.t(locale, key)
  screens/           login, home, hives, new_harvest, batches, sync, settings
  widgets/
    status_chip.dart colored status chip
```

## 6. Run it

```bash
cd teamvibranium2026/honeychain/app
flutter create .          # generates android/ios platform folders (first time)
flutter pub get           # downloads packages (clears all LSP "package not found" errors)
flutter run               # with Android device/emulator connected
```

API connection: Android emulator reaches your laptop via `10.0.2.2:4000` (already the default). Physical phone: change base URL in Settings to your PC's LAN IP, both on same WiFi.

## 7. The 60-second demo (memorize this)

1. **Turn ON airplane mode**
2. Login (any number) -> Hives -> add "Farm Box 1"
3. New Harvest -> weight 42, flora Mustard, photo, GPS -> **SAVE OFFLINE**
4. SnackBar: "Saved offline. Will sync automatically." -> Batches tab shows ORANGE queued
5. Sync tab -> shows queued batch, airplane-mode hint
6. **Turn OFF airplane mode** -> tap SYNC NOW
7. Batch turns GREEN with txHash -> "this harvest is now recorded on the blockchain, forever"

That orange-to-green moment is the heart of the pitch.

## 8. Judge Q&A quick answers

**"What if the farmer never gets network?"**
Batches persist locally indefinitely; any later sync flushes them. The data is never lost - it is just delayed. We chose SQLite queue over requiring connectivity because trust systems that fail offline fail farmers.

**"How do you stop fake harvests from the farmer himself?"**
Photo + GPS at creation bind the batch to a place and time; the FPO's independent weighing at collection cross-checks quantity. Fraud detection is multi-party by design.

**"Why not WhatsApp-based entry instead of an app?"**
Roadmap module. WhatsApp bot cannot do offline queueing reliably or hold photo+GPS evidence with integrity; the app can, and later versions can mirror notifications to WhatsApp.

**"Photo storage?"**
Photos stay on-device + hash sent to chain; production plan pushes originals to object storage with the hash reference (DPDP-friendly: personal data off-chain).

## 9. Roadmap (post-submission)

- Push notifications for disease alerts (FCM)
- Voice logging (speech_to_text) for hands-free entry
- WhatsApp mirror bot for batch status
- Biometric/PIN app lock
- IoT hive-weight sensor cards (simulated now)

## 10. Known limitations (honesty slide)

- Auth is a demo stub (any phone logs in) - production uses Firebase phone OTP
- Sync is manual-button + on-open trigger, not full background service (workmanager planned)
- Photo upload sends path+hash only; object storage integration pending
- iOS untested (Android-first, as our users are Android)
