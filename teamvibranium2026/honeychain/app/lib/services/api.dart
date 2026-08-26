import 'dart:convert';

import 'package:http/http.dart' as http;

class SyncException implements Exception {
  final String message;
  SyncException(this.message);

  @override
  String toString() => 'SyncException: $message';
}

class ApiClient {
  static String baseUrl = 'http://10.0.2.2:4000';
  static const Duration timeoutDuration = Duration(seconds: 10);

  static Future<List<Map<String, dynamic>>> syncBatches(
    List<Map<String, dynamic>> payloads,
  ) async {
    if (payloads.isEmpty) return [];
    final uri = Uri.parse('$baseUrl/api/batches');
    final response = await http
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'batches': payloads}),
        )
        .timeout(timeoutDuration);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw SyncException('Server responded HTTP ${response.statusCode}');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw SyncException('Malformed sync response');
    }
    final inserted = decoded['inserted'];
    if (inserted is! List) {
      throw SyncException('Missing inserted[] in response');
    }
    return inserted.whereType<Map<String, dynamic>>().toList();
  }

  static Future<Map<String, dynamic>> getPublicBatch(int id) async {
    final uri = Uri.parse('$baseUrl/api/public/batches/$id');
    final response = await http.get(uri).timeout(timeoutDuration);
    if (response.statusCode != 200) {
      throw SyncException('HTTP ${response.statusCode}');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw SyncException('Malformed batch response');
    }
    return decoded;
  }
}
