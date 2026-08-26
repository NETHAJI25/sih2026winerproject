# HoneyChain — Mobile App

Offline-first harvest logging for beekeepers (SIH 2026 · Team Vibranium 2026).

Flutter + Provider + sqflite (local outbox queue) + geolocator + image_picker + http.

## Run

```bash
cd teamvibranium2026/honeychain/app
flutter create . --project-name honeychain_app --org com.teamvibranium --platforms android,ios
flutter pub get
flutter run
```

`flutter create .` generates the `android/` and `ios/` platform folders around this Dart source.

Backend default: `http://10.0.2.2:4000` (Android emulator loopback to host machine). Override it in the Settings tab.

## Demo script (airplane mode)

1. Launch app → enter any phone number → **Enter** (demo login: Ravi Kumar, beekeeper).
2. **Hives** tab → add 1–2 hives (name / box count / notes).
3. Enable **airplane mode**.
4. **Batches** tab → **New Harvest** → pick hive, weight, flora, photo, GPS → **Save Offline**.
   - Batch is stored locally in SQLite as **Queued** (orange chip); SnackBar confirms offline save.
5. Open **Sync** tab → queued counter shows the batch; pressing Sync Now offline fails gracefully → batch flips to red **Error**.
6. Disable **airplane mode**.
7. Press **Sync Now** → batches turn **green (Synced)** with short `txHash` subtitles; the AppBar chip drops to 0; last-sync timestamp updates.
8. Verify provenance any time: `GET {baseUrl}/api/public/batches/{serverId}`.

## Notes

- Each batch gets a client-generated UUID-style id (`DateTime` timestamp + `Random`) used as idempotency key when syncing.
- Status lifecycle: `queued → syncing → synced | error`, stored in SQLite as string indexes.
- Locales: English, हिंदी, தமிழ் (Settings tab).
