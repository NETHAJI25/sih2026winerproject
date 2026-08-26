import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});
  Future<Map> _stats() async {
    final r = await http.get(Uri.parse(
        'https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches.json'));
    final m = jsonDecode(r.body);
    if (m is! Map) return {'total': 0, 'flagged': 0};
    final vals = m.values.toList();
    return {
      'total': vals.length,
      'flagged': vals.where((b) => b['status'] == 'flagged').length
    };
  }

  @override
  Widget build(BuildContext c) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin / KVIC — Fraud & Heatmap')),
      body: FutureBuilder(
        future: _stats(),
        builder: (c, s) {
          final d = s.data ?? {'total': 0, 'flagged': 0};
          return ListView(padding: const EdgeInsets.all(12), children: [
            Card(
                child: ListTile(
                    title: Text("Total batches: ${d['total']}"),
                    subtitle: Text(
                        "Flagged: ${d['flagged']} — weight 42→55kg impossible"))),
            const Card(
                child: ListTile(
                    title: Text('Heatmap'),
                    subtitle: Text(
                        'Production density by district — Leaflet placeholder'))),
            Card(
                child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Cluster Onboarding — FPO CSV',
                              style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          FilledButton(
                              onPressed: () async {
                                await http.put(
                                    Uri.parse(
                                        'https://sih2026-b9ef7-default-rtdb.firebaseio.com/clusters/demo.json'),
                                    headers: {
                                      'Content-Type': 'application/json'
                                    },
                                    body: jsonEncode({
                                      'name': 'Tiruvallur FPO',
                                      'farmers': 12,
                                      'status': 'Active'
                                    }));
                                ScaffoldMessenger.of(c).showSnackBar(
                                    const SnackBar(
                                        content:
                                            Text('Cluster onboarded → RTDB')));
                              },
                              child: const Text('Onboard Demo Cluster → RTDB')),
                        ]))),
            const Card(
                child: ListTile(
                    title: Text('Users'),
                    subtitle: Text(
                        'Role filter — deactivate/reactivate — search by name'))),
          ]);
        },
      ),
    );
  }
}
