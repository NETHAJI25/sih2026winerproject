import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../l10n/strings.dart';
import '../models/batch.dart';
import '../providers/sync_provider.dart';
import '../services/db.dart';
import '../widgets/status_chip.dart';
import 'new_harvest_screen.dart';

class BatchesScreen extends StatefulWidget {
  const BatchesScreen({super.key});

  @override
  State<BatchesScreen> createState() => _BatchesScreenState();
}

class _BatchesScreenState extends State<BatchesScreen> {
  late Future<List<Batch>> _future;
  bool _syncing = false;

  @override
  void initState() {
    super.initState();
    _future = Db.getBatches();
  }

  void _reload() {
    setState(() => _future = Db.getBatches());
  }

  Future<void> _syncAndReload() async {
    if (_syncing) return;
    setState(() => _syncing = true);
    await context.read<SyncProvider>().syncAll();
    if (!mounted) return;
    setState(() {
      _syncing = false;
      _future = Db.getBatches();
    });
  }

  Future<void> _openNewHarvest() async {
    await Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const NewHarvestScreen()));
    if (!mounted) return;
    _reload();
    context.read<SyncProvider>().refreshQueuedCount();
  }

  String _fmtWeight(double w) =>
      w == w.roundToDouble() ? w.toStringAsFixed(0) : w.toStringAsFixed(2);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Card(
            margin: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            child: ListTile(
              leading: Icon(Icons.lightbulb, color: Colors.amber.shade700),
              title: Text(
                S.t(S.locale, 'yieldTip'),
                style: const TextStyle(fontSize: 13),
              ),
              dense: true,
            ),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              tooltip: S.t(S.locale, 'syncNow'),
              onPressed: _syncing ? null : _syncAndReload,
              icon: _syncing
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.refresh),
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _syncAndReload,
              child: FutureBuilder<List<Batch>>(
                future: _future,
                builder: (context, snap) {
                  if (snap.connectionState != ConnectionState.done) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  final batches = snap.data ?? const <Batch>[];
                  if (batches.isEmpty) {
                    return ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(
                          height: MediaQuery.of(context).size.height * 0.3,
                        ),
                        Center(child: Text(S.t(S.locale, 'batches'))),
                      ],
                    );
                  }
                  return ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(12, 0, 12, 88),
                    itemCount: batches.length,
                    itemBuilder: (context, i) {
                      final b = batches[i];
                      final when = DateFormat(
                        'dd MMM yyyy · HH:mm',
                      ).format(b.harvestDate);
                      final tx = b.txHash == null
                          ? null
                          : (b.txHash!.length <= 10
                                ? b.txHash!
                                : b.txHash!.substring(0, 10));
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        child: ListTile(
                          leading: const Icon(
                            Icons.water_drop,
                            color: Color(0xFFB45309),
                          ),
                          title: Text(
                            '${b.floraType} · ${_fmtWeight(b.weightKg)} kg',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          subtitle: Text(tx == null ? when : '$when\ntx: $tx…'),
                          isThreeLine: tx != null,
                          trailing: StatusChip(status: b.status),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'newHarvestFab',
        onPressed: _openNewHarvest,
        icon: const Icon(Icons.add),
        label: Text(S.t(S.locale, 'newHarvest')),
      ),
    );
  }
}
