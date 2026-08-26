class Hive {
  final int? id;
  final String name;
  final int boxCount;
  final String notes;
  final DateTime? lastInspection;

  Hive({
    this.id,
    required this.name,
    required this.boxCount,
    this.notes = '',
    this.lastInspection,
  });

  Map<String, dynamic> toDbMap() => {
    if (id != null) 'id': id,
    'name': name,
    'box_count': boxCount,
    'notes': notes,
    'last_inspection': lastInspection?.toIso8601String(),
  };

  factory Hive.fromDbMap(Map<String, dynamic> m) => Hive(
    id: m['id'] as int?,
    name: m['name'] as String,
    boxCount: (m['box_count'] as num?)?.toInt() ?? 0,
    notes: (m['notes'] as String?) ?? '',
    lastInspection: m['last_inspection'] == null
        ? null
        : DateTime.parse(m['last_inspection'] as String),
  );
}
