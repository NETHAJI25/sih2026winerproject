import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../providers/auth_provider.dart';

class PackagingScreen extends StatefulWidget {
  const PackagingScreen({super.key});
  @override
  State<PackagingScreen> createState() => _PackagingScreenState();
}

class _PackagingScreenState extends State<PackagingScreen> {
  String _size = '250ml';
  final _count = TextEditingController(text: '166');
  Future<List> _incoming() async {
    final r = await http.get(Uri.parse(
        'https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches.json'));
    final m = jsonDecode(r.body);
    if (m is! Map) return [];
    return m.values
        .where((b) => b['status'] == 'tested' || b['status'] == 'packaged')
        .toList();
  }

  @override
  Widget build(BuildContext c) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Packaging — QR'),
        leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => c.read<AuthProvider>().setRole('beekeeper')),
      ),
      body: FutureBuilder(
        future: _incoming(),
        builder: (c, s) {
          if (!s.hasData)
            return const Center(child: CircularProgressIndicator());
          final list = s.data as List;
          return ListView(
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Bottle size',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    DropdownButton<String>(
                      value: _size,
                      items: const [
                        DropdownMenuItem(value: '100ml', child: Text('100ml')),
                        DropdownMenuItem(value: '250ml', child: Text('250ml')),
                        DropdownMenuItem(value: '500ml', child: Text('500ml')),
                        DropdownMenuItem(value: '1kg', child: Text('1kg')),
                      ],
                      onChanged: (v) {
                        setState(() => _size = v!);
                      },
                    ),
                    TextField(
                        controller: _count,
                        decoration:
                            const InputDecoration(labelText: 'Bottle count'),
                        keyboardType: TextInputType.number),
                  ],
                ),
              ),
              ...list.map((b) {
                return Card(
                  margin: const EdgeInsets.all(8),
                  child: ListTile(
                    title: Text("${b['id']}"),
                    subtitle: Text("Ready → $_size x ${_count.text}"),
                    trailing: FilledButton(
                      onPressed: () async {
                        final qr =
                            "https://web-mocha-three-89.vercel.app/verify/${b['id']}?lot=${DateTime.now().millisecondsSinceEpoch.toRadixString(36)}";
                        await http.put(
                            Uri.parse(
                                "https://sih2026-b9ef7-default-rtdb.firebaseio.com/packages/${b['id']}.json"),
                            headers: {'Content-Type': 'application/json'},
                            body: jsonEncode({
                              'qrData': qr,
                              'bottleCount': int.tryParse(_count.text) ?? 0,
                              'size': _size
                            }));
                        await http.patch(
                            Uri.parse(
                                "https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches/${b['id']}.json"),
                            headers: {'Content-Type': 'application/json'},
                            body: jsonEncode(
                                {'status': 'packaged', 'qrData': qr}));
                        ScaffoldMessenger.of(c).showSnackBar(
                            SnackBar(content: Text('QR locked $qr')));
                      },
                      child: const Text('Generate QR'),
                    ),
                  ),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}
