import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CustomerScreen extends StatefulWidget {
  const CustomerScreen({super.key});
  @override
  State<CustomerScreen> createState() => _CustomerScreenState();
}

class _CustomerScreenState extends State<CustomerScreen> {
  final _batchCtrl = TextEditingController(text: 'B-1042');
  Map? _batch;
  Future<void> _verify() async {
    final id = _batchCtrl.text.trim();
    final r = await http.get(Uri.parse(
        'https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches/$id.json'));
    if (r.statusCode == 200) {
      final d = jsonDecode(r.body);
      setState(() => _batch = d is Map ? d : null);
    } else
      setState(() => _batch = null);
  }

  @override
  Widget build(BuildContext c) {
    return Scaffold(
      appBar: AppBar(title: const Text('Customer — Scan & Verify')),
      body: ListView(padding: const EdgeInsets.all(12), children: [
        TextField(
            controller: _batchCtrl,
            decoration: const InputDecoration(
                labelText: 'Enter Batch ID or Scan QR',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.qr_code))),
        const SizedBox(height: 8),
        FilledButton(onPressed: _verify, child: const Text('Verify')),
        if (_batch != null)
          Card(
              margin: const EdgeInsets.only(top: 12),
              child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                            "${_batch!['id']} — ${_batch!['floraType'] ?? _batch!['flora']}",
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                        Text(
                            "Farmer ${_batch!['farmer']?['name'] ?? ''} • ${_batch!['weightKg']}kg • ${_batch!['status']}"),
                        const SizedBox(height: 8),
                        const Text(
                            'Journey — farm → lab → pack → retail (timeline)'),
                        const SizedBox(height: 8),
                        FilledButton(
                            onPressed: () async {
                              await http.post(
                                  Uri.parse(
                                      'https://sih2026-b9ef7-default-rtdb.firebaseio.com/reports.json'),
                                  headers: {'Content-Type': 'application/json'},
                                  body: jsonEncode({
                                    'batchId': _batch!['id'],
                                    'type': 'Adulteration suspected',
                                    'ts': DateTime.now().millisecondsSinceEpoch
                                  }));
                              ScaffoldMessenger.of(c).showSnackBar(const SnackBar(
                                  content: Text(
                                      'Report submitted with proof → RTDB /reports')));
                            },
                            child: const Text('Report Issue with Proof')),
                      ]))),
        const Card(
            margin: EdgeInsets.only(top: 12),
            child: ListTile(
                title: Text('Customer Care'),
                subtitle: Text(
                    'nethajiramesh25@gmail.com • +91-877864603\nTiruvallur FPO Helpline 9am-6pm'))),
      ]),
    );
  }
}
