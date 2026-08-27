import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../providers/auth_provider.dart';

class LabScreen extends StatefulWidget {
  const LabScreen({super.key});
  @override
  State<LabScreen> createState() => _LabScreenState();
}

class _LabScreenState extends State<LabScreen> {
  String _type = 'NMR';
  bool _pass = true;
  Future<List> _queue() async {
    final r = await http.get(Uri.parse(
        'https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches.json'));
    final m = jsonDecode(r.body);
    if (m is! Map) return [];
    return m.values
        .where((b) => b['status'] == 'in_transit' || b['status'] == 'created')
        .toList();
  }

  @override
  Widget build(BuildContext c) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Lab — Testing (NMR/PASS)'),
          leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => c.read<AuthProvider>().setRole('beekeeper')),
        ),
        body: FutureBuilder(
            future: _queue(),
            builder: (c, s) {
              if (!s.hasData)
                return const Center(child: CircularProgressIndicator());
              final list = s.data as List;
              return ListView(children: [
                Padding(
                    padding: const EdgeInsets.all(12),
                    child: Text('Queue: ${list.length} batches',
                        style: const TextStyle(fontWeight: FontWeight.bold))),
                ...list.map((b) => Card(
                    margin: const EdgeInsets.all(8),
                    child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("${b['id']} • ${b['floraType'] ?? ''}",
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold)),
                              DropdownButton<String>(
                                  value: _type,
                                  items: const [
                                    DropdownMenuItem(
                                        value: 'NMR', child: Text('NMR')),
                                    DropdownMenuItem(
                                        value: 'Moisture',
                                        child: Text('Moisture')),
                                    DropdownMenuItem(
                                        value: 'HMF', child: Text('HMF'))
                                  ],
                                  onChanged: (v) {
                                    setState(() => _type = v!);
                                  }),
                              SwitchListTile(
                                  title: Text(_pass ? 'PASS' : 'FAIL'),
                                  value: _pass,
                                  onChanged: (v) {
                                    setState(() => _pass = v);
                                  }),
                              FilledButton(
                                  onPressed: () async {
                                    await http.put(
                                        Uri.parse(
                                            "https://sih2026-b9ef7-default-rtdb.firebaseio.com/quality/${b['id']}/test.json"),
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: jsonEncode({
                                          'testType': _type,
                                          'passed': _pass,
                                          'labName': 'Apex Pune',
                                          'certificateHash': '0x' +
                                              DateTime.now()
                                                  .millisecondsSinceEpoch
                                                  .toRadixString(16)
                                        }));
                                    await http.patch(
                                        Uri.parse(
                                            "https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches/${b['id']}.json"),
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: jsonEncode({
                                          'status': _pass ? 'tested' : 'flagged'
                                        }));
                                    ScaffoldMessenger.of(c).showSnackBar(SnackBar(
                                        content: Text(
                                            'Lab ${_pass ? 'PASS' : 'FAIL'} → RTDB for ${b['id']}')));
                                    setState(() {});
                                  },
                                  child: const Text('Submit Test → RTDB'))
                            ]))))
              ]);
            }));
  }
}
