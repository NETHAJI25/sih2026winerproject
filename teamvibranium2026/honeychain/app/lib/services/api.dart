import 'dart:convert';

import 'package:http/http.dart' as http;

class SyncException implements Exception {
  final String message;
  SyncException(this.message);

  @override
  String toString() => 'SyncException: $message';
}

class ApiClient {
  static String baseUrl = 'https://sih2026-b9ef7-default-rtdb.firebaseio.com';
  static const Duration timeoutDuration = Duration(seconds: 10);

  static Future<List<Map<String, dynamic>>> syncBatches(
    List<Map<String, dynamic>> payloads,
  ) async {
    if (payloads.isEmpty) return [];
    final List<Map<String, dynamic>> inserted = [];
    for (final p in payloads) {
      final id =
          p['clientBatchId'] ??
          p['id'] ??
          'B-${DateTime.now().millisecondsSinceEpoch}';
      final uri = Uri.parse('$baseUrl/batches/$id.json');
      final body = {
        ...p,
        'id': id,
        'status': 'created',
        'syncedAt': DateTime.now().toIso8601String(),
      };
      final r = await http
          .put(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          )
          .timeout(timeoutDuration);
      if (r.statusCode < 200 || r.statusCode >= 300)
        throw SyncException('RTDB PUT ${r.statusCode} for $id');
      inserted.add({
        ...body,
        'txHash': '0xRTDB${id.hashCode.toRadixString(16)}',
      });
      await http
          .put(
            Uri.parse('$baseUrl/transfers/$id/init.json'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'batchId': id,
              'weightKg': p['weightKg'],
              'ts': DateTime.now().millisecondsSinceEpoch,
              'txHash': '0xRTDB',
            }),
          )
          .timeout(timeoutDuration);
    }
    return inserted;
  }

  static Future<Map<String, dynamic>> getPublicBatch(dynamic id) async {
    final uri = Uri.parse('$baseUrl/batches/$id.json');
    final r = await http.get(uri).timeout(timeoutDuration);
    if (r.statusCode != 200) throw SyncException('HTTP ${r.statusCode}');
    final decoded = jsonDecode(r.body);
    if (decoded == null) throw SyncException('Batch $id not found in RTDB');
    if (decoded is! Map<String, dynamic>)
      throw SyncException('Malformed batch');
    return decoded;
  }

  static Future<Map<String, dynamic>?> getBatchDirect(String id) async {
    final uri = Uri.parse('$baseUrl/batches/$id.json');
    final r = await http.get(uri).timeout(timeoutDuration);
    if (r.statusCode != 200) return null;
    final d = jsonDecode(r.body);
    return d is Map<String, dynamic> ? d : null;
  }
}
