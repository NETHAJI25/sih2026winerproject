import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../l10n/strings.dart';
import '../models/batch.dart';
import '../providers/sync_provider.dart';
import '../services/db.dart';
import '../widgets/status_chip.dart';

class SyncScreen extends StatefulWidget {
  const SyncScreen({super.key});

  @override
  State<SyncScreen> createState() => _SyncScreenState();
}

class _SyncScreenState extends State<SyncScreen> {
  bool _wasSyncing = false;
  late Future<List<Batch>> _pending;

  @override
  void initState() {
    super.initState();
    _pending = Db.pendingBatches();
  }

  Future<void> _sync() async {
    await context.read<SyncProvider>().syncAll();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<SyncProvider>(
      builder: (context, sync, _) {
        if (_wasSyncing && !sync.isSyncing) {
          _pending = Db.pendingBatches();
        }
        _wasSyncing = sync.isSyncing;
        return ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            SizedBox(
              width: double.infinity,
              height: 56,
              child: FilledButton.icon(
                onPressed: sync.isSyncing ? null : _sync,
                icon: sync.isSyncing
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.cloud_sync),
                label: Text(
                  sync.isSyncing
                      ? S.t(S.locale, 'syncing')
                      : S.t(S.locale, 'syncNow'),
                  style: const TextStyle(fontSize: 16),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: Text(
                '${S.t(S.locale, 'queued')}: ${sync.queuedCount}'
                '${sync.lastSync == null ? '' : '   ·   Last sync: ${DateFormat('dd MMM, HH:mm:ss').format(sync.lastSync!)}'}',
                style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
              ),
            ),
            const SizedBox(height: 8),
            Card(
              color: Colors.blueGrey.shade50,
              child: const ListTile(
                leading: Icon(Icons.airplanemode_active),
                title: Text(
                  'Airplane-mode demo',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                subtitle: Text(
                  'Turn ON airplane mode → New Harvest → Save Offline (batch stays Queued). '
                  'Turn OFF airplane mode → press Sync Now → batches turn green with a txHash.',
                  style: TextStyle(fontSize: 12),
                ),
                dense: true,
              ),
            ),
            const Divider(height: 24),
            if (sync.progress.isNotEmpty)
              for (final item in sync.progress)
                Card(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  child: ListTile(
                    leading: const Icon(Icons.bolt),
                    title: Text(
                      '${item.batch.floraType} · ${item.batch.weightKg} kg',
                    ),
                    subtitle: Text(item.statusText),
                  ),
                )
            else
              FutureBuilder<List<Batch>>(
                future: _pending,
                builder: (context, snap) {
                  final items = snap.data ?? const <Batch>[];
                  if (items.isEmpty) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 32),
                      child: Center(
                        child: Text(
                          'Nothing pending. All clear!',
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                      ),
                    );
                  }
                  return Column(
                    children: [
                      for (final b in items)
                        Card(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          child: ListTile(
                            title: Text('${b.floraType} · ${b.weightKg} kg'),
                            subtitle: Text(b.hiveName),
                            trailing: StatusChip(status: b.status),
                          ),
                        ),
                    ],
                  );
                },
              ),
          ],
        );
      },
    );
  }
}
