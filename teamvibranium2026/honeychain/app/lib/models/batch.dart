import 'dart:math';

enum BatchStatus { queued, syncing, synced, error }

class Batch {
  final String clientBatchId;
  final int? serverId;
  final String hiveName;
  final double weightKg;
  final String floraType;
  final String? photoPath;
  final double? geoLat;
  final double? geoLng;
  final DateTime harvestDate;
  BatchStatus status;
  String? txHash;

  Batch({
    required this.clientBatchId,
    this.serverId,
    required this.hiveName,
    required this.weightKg,
    required this.floraType,
    this.photoPath,
    this.geoLat,
    this.geoLng,
    required this.harvestDate,
    this.status = BatchStatus.queued,
    this.txHash,
  });

  static String newClientBatchId() {
    final rnd = Random.secure();
    String hex(int count) =>
        List.generate(count, (_) => rnd.nextInt(16).toRadixString(16)).join();
    const variants = ['8', '9', 'a', 'b'];
    final ts = DateTime.now().microsecondsSinceEpoch.toRadixString(36);
    final variant = variants[rnd.nextInt(variants.length)];
    return '$ts-${hex(4)}-4${hex(3)}-$variant${hex(3)}-${hex(12)}';
  }

  Map<String, dynamic> toJson() => {
    'clientBatchId': clientBatchId,
    'hiveName': hiveName,
    'weightKg': weightKg,
    'floraType': floraType,
    'geo': {'lat': geoLat, 'lng': geoLng},
    'harvestDate': harvestDate.toIso8601String(),
  };

  Map<String, dynamic> toDbMap() => {
    'client_batch_id': clientBatchId,
    'server_id': serverId,
    'hive_name': hiveName,
    'weight_kg': weightKg,
    'flora_type': floraType,
    'photo_path': photoPath,
    'geo_lat': geoLat,
    'geo_lng': geoLng,
    'harvest_date': harvestDate.toIso8601String(),
    'status': status.index.toString(),
    'tx_hash': txHash,
  };

  factory Batch.fromDbMap(Map<String, dynamic> m) => Batch(
    clientBatchId: m['client_batch_id'] as String,
    serverId: m['server_id'] as int?,
    hiveName: m['hive_name'] as String,
    weightKg: (m['weight_kg'] as num).toDouble(),
    floraType: m['flora_type'] as String,
    photoPath: m['photo_path'] as String?,
    geoLat: (m['geo_lat'] as num?)?.toDouble(),
    geoLng: (m['geo_lng'] as num?)?.toDouble(),
    harvestDate: DateTime.parse(m['harvest_date'] as String),
    status: BatchStatus.values[int.tryParse('${m['status']}') ?? 0],
    txHash: m['tx_hash'] as String?,
  );
}
