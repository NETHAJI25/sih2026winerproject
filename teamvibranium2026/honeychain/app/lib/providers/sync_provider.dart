import 'package:flutter/foundation.dart';

import '../models/batch.dart';
import '../services/api.dart';
import '../services/db.dart';

class SyncProgressItem {
  final Batch batch;
  final String statusText;

  SyncProgressItem(this.batch, this.statusText);
}

class SyncProvider extends ChangeNotifier {
  bool isSyncing = false;
  DateTime? lastSync;
  int queuedCount = 0;
  List<SyncProgressItem> progress = [];

  Future<void> refreshQueuedCount() async {
    final pending = await Db.pendingBatches();
    queuedCount = pending.length;
    notifyListeners();
  }

  Future<void> syncAll() async {
    if (isSyncing) return;
    isSyncing = true;
    progress = [];
    notifyListeners();

    final pending = await Db.pendingBatches();
    progress = [for (final b in pending) SyncProgressItem(b, 'waiting')];
    if (progress.isNotEmpty) notifyListeners();

    for (final b in pending) {
      await Db.markSyncing(b.clientBatchId);
    }

    try {
      final payloads = pending.map((b) => b.toJson()).toList();
      final results = await ApiClient.syncBatches(payloads);
      final byClientId = <String, Map<String, dynamic>>{
        for (final r in results)
          if (r['clientBatchId'] is String) r['clientBatchId'] as String: r,
      };
      for (final b in pending) {
        try {
          final match = byClientId[b.clientBatchId];
          if (match == null) {
            await Db.markError(b.clientBatchId);
            _updateProgress(b.clientBatchId, 'error');
          } else {
            final serverId = (match['id'] as num?)?.toInt() ?? 0;
            final txHash = match['txHash'] as String?;
            await Db.markSynced(b.clientBatchId, serverId, txHash);
            _updateProgress(
              b.clientBatchId,
              txHash == null ? 'synced' : 'synced · ${_short(txHash)}',
            );
          }
        } catch (e) {
          await Db.markError(b.clientBatchId);
          _updateProgress(b.clientBatchId, 'error: $e');
        }
      }
      lastSync = DateTime.now();
    } catch (e) {
      for (final b in pending) {
        await Db.markError(b.clientBatchId);
        _updateProgress(b.clientBatchId, 'error: $e');
      }
    } finally {
      isSyncing = false;
      await refreshQueuedCount();
      notifyListeners();
    }
  }

  void _updateProgress(String clientId, String statusText) {
    progress = [
      for (final p in progress)
        if (p.batch.clientBatchId == clientId)
          SyncProgressItem(p.batch, statusText)
        else
          p,
    ];
    notifyListeners();
  }

  static String _short(String hash) =>
      hash.length <= 10 ? hash : hash.substring(0, 10);
}
