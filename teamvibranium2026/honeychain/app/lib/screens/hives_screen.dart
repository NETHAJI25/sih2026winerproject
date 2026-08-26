import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../l10n/strings.dart';
import '../models/hive.dart';
import '../services/db.dart';

class HivesScreen extends StatefulWidget {
  const HivesScreen({super.key});

  @override
  State<HivesScreen> createState() => _HivesScreenState();
}

class _HivesScreenState extends State<HivesScreen> {
  late Future<List<Hive>> _future;

  @override
  void initState() {
    super.initState();
    _future = Db.getHives();
  }

  void _reload() {
    setState(() => _future = Db.getHives());
  }

  Future<void> _addHive() async {
    final nameCtrl = TextEditingController();
    final boxesCtrl = TextEditingController(text: '1');
    final notesCtrl = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(S.t(S.locale, 'addHive')),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                autofocus: true,
                decoration: const InputDecoration(
                  labelText: 'Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: boxesCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Box count',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: notesCtrl,
                decoration: const InputDecoration(
                  labelText: 'Notes',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Save'),
          ),
        ],
      ),
    );
    final name = nameCtrl.text.trim();
    if (confirmed != true || name.isEmpty) return;
    await Db.insertHive(
      Hive(
        name: name,
        boxCount: int.tryParse(boxesCtrl.text.trim()) ?? 1,
        notes: notesCtrl.text.trim(),
        lastInspection: DateTime.now(),
      ),
    );
    _reload();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Card(
            margin: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            child: ListTile(
              leading: Icon(
                Icons.health_and_safety,
                color: Colors.amber.shade800,
              ),
              title: Text(
                S.t(S.locale, 'diseaseAlert'),
                style: const TextStyle(fontSize: 13),
              ),
              dense: true,
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Hive>>(
              future: _future,
              builder: (context, snap) {
                if (snap.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                final hives = snap.data ?? const <Hive>[];
                if (hives.isEmpty) {
                  return Center(
                    child: Text(
                      'No hives yet. Tap + to add one.',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: hives.length,
                  itemBuilder: (context, i) {
                    final h = hives[i];
                    final inspected = h.lastInspection == null
                        ? '—'
                        : DateFormat('dd MMM yyyy').format(h.lastInspection!);
                    return Card(
                      child: ListTile(
                        leading: const Icon(
                          Icons.hive,
                          color: Color(0xFFB45309),
                        ),
                        title: Text(
                          h.name,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        subtitle: Text(
                          '${h.boxCount} boxes\nLast inspection: $inspected',
                        ),
                        isThreeLine: true,
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'addHiveFab',
        onPressed: _addHive,
        icon: const Icon(Icons.add),
        label: Text(S.t(S.locale, 'addHive')),
      ),
    );
  }
}
