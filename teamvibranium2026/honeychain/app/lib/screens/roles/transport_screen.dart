import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../providers/auth_provider.dart';

class TransportScreen extends StatelessWidget {
  const TransportScreen({super.key});
  Future<List> _pickups() async {
    final r = await http.get(Uri.parse(
        'https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches.json'));
    if (r.statusCode != 200) return [];
    final m = jsonDecode(r.body);
    if (m is! Map) return [];
    return m.values
        .where((b) => (b['status'] ?? 'created') == 'created')
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Transport — Pickups'),
          leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () =>
                  context.read<AuthProvider>().setRole('beekeeper')),
          actions: [
            IconButton(
                icon: const Icon(Icons.switch_account),
                onPressed: () =>
                    context.read<AuthProvider>().setRole('beekeeper'),
                tooltip: 'Back to Farmer (no login)')
          ],
        ),
        body: FutureBuilder(
            future: _pickups(),
            builder: (c, s) {
              if (!s.hasData)
                return const Center(child: CircularProgressIndicator());
              final list = s.data as List;
              if (list.isEmpty)
                return const Center(
                    child: Text('No pickups — Farmer batches appear here'));
              return ListView.builder(
                  itemCount: list.length,
                  itemBuilder: (c, i) {
                    final b = list[i];
                    return Card(
                        margin: const EdgeInsets.all(8),
                        child: ListTile(
                            title: Text(
                                "${b['id']} • ${b['floraType'] ?? b['flora']}"),
                            subtitle: Text(
                                "Farmer ${b['farmer']?['name'] ?? ''} • ${b['weightKg']}kg"),
                            trailing: FilledButton(
                                onPressed: () async {
                                  await http.put(
                                      Uri.parse(
                                          "https://sih2026-b9ef7-default-rtdb.firebaseio.com/transfers/${b['id']}/pickup.json"),
                                      headers: {
                                        'Content-Type': 'application/json'
                                      },
                                      body: jsonEncode({
                                        'weightKg': b['weightKg'],
                                        'ts': DateTime.now()
                                            .millisecondsSinceEpoch,
                                        'tx': '0xRTDB'
                                      }));
                                  await http.patch(
                                      Uri.parse(
                                          "https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches/${b['id']}.json"),
                                      headers: {
                                        'Content-Type': 'application/json'
                                      },
                                      body:
                                          jsonEncode({'status': 'in_transit'}));
                                  ScaffoldMessenger.of(c).showSnackBar(
                                      const SnackBar(
                                          content: Text(
                                              'Pickup confirmed → RTDB, visible in web')));
                                },
                                child: const Text('Confirm Pickup'))));
                  });
            }));
  }
}
