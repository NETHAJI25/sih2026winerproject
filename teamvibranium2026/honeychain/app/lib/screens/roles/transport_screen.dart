import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../providers/auth_provider.dart';

class TransportScreen extends StatelessWidget {
  const TransportScreen({super.key});
  Future<List> _pickups() async {
    try {
      final r = await http
          .get(Uri.parse(
              'https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches.json'))
          .timeout(const Duration(seconds: 2));
      if (r.statusCode == 200) {
        final m = jsonDecode(r.body);
        if (m is Map) {
          final live = m.values
              .where((b) => (b['status'] ?? 'created') == 'created')
              .toList();
          if (live.isNotEmpty) return live;
        }
      }
    } catch (_) {}
    return [
      {
        'id': 'B-1042',
        'floraType': 'Mustard',
        'farmer': {'name': 'Ravi Kumar'},
        'weightKg': 42
      },
      {
        'id': 'B-1027',
        'floraType': 'Eucalyptus',
        'farmer': {'name': 'Jose Thomas'},
        'weightKg': 60
      },
    ];
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
                        margin: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        elevation: 1,
                        child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            leading: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.asset(
                                'assets/flora/${(b['floraType'] ?? 'mustard').toString().toLowerCase()}.jpg',
                                width: 48,
                                height: 48,
                                fit: BoxFit.cover,
                                errorBuilder: (c, e, s) =>
                                    const Icon(Icons.local_shipping, size: 28),
                              ),
                            ),
                            title: Text(
                                "${b['id']} • ${b['floraType'] ?? b['flora']}",
                                style: const TextStyle(
                                    fontWeight: FontWeight.w600, fontSize: 14)),
                            subtitle: Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                  "Farmer ${b['farmer']?['name'] ?? ''} • ${b['weightKg']}kg",
                                  style: const TextStyle(fontSize: 12)),
                            ),
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
