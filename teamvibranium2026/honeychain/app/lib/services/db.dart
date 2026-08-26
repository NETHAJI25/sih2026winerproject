import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart' hide Batch;

import '../models/batch.dart';
import '../models/hive.dart';

class Db {
  static Database? _db;

  static Future<Database> get instance async {
    final existing = _db;
    if (existing != null) return existing;
    final opened = await _open();
    _db = opened;
    return opened;
  }

  static Future<Database> _open() {
    return getDatabasesPath().then((dir) {
      return openDatabase(
        join(dir, 'honeychain.db'),
        version: 1,
        onCreate: (db, version) async {
          await db.execute('''
CREATE TABLE IF NOT EXISTS batches (
  client_batch_id TEXT PRIMARY KEY,
  server_id INTEGER,
  hive_name TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  flora_type TEXT NOT NULL,
  photo_path TEXT,
  geo_lat REAL,
  geo_lng REAL,
  harvest_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '0',
  tx_hash TEXT
)
''');
          await db.execute('''
CREATE TABLE IF NOT EXISTS hives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  box_count INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  last_inspection TEXT
)
''');
        },
      );
    });
  }

  static Future<int> insertHive(Hive hive) async {
    final db = await instance;
    return db.insert('hives', hive.toDbMap());
  }

  static Future<List<Hive>> getHives() async {
    final db = await instance;
    final rows = await db.query('hives', orderBy: 'name ASC');
    return rows.map(Hive.fromDbMap).toList();
  }

  static Future<int> insertBatch(Batch batch) async {
    final db = await instance;
    return db.insert('batches', batch.toDbMap());
  }

  static Future<List<Batch>> getBatches() async {
    final db = await instance;
    final rows = await db.query('batches', orderBy: 'harvest_date DESC');
    return rows.map(Batch.fromDbMap).toList();
  }

  static Future<List<Batch>> pendingBatches() async {
    final db = await instance;
    final rows = await db.query(
      'batches',
      where: 'status = ? OR status = ?',
      whereArgs: [
        BatchStatus.queued.index.toString(),
        BatchStatus.error.index.toString(),
      ],
      orderBy: 'harvest_date DESC',
    );
    return rows.map(Batch.fromDbMap).toList();
  }

  static Future<int> markSyncing(String clientBatchId) =>
      _updateStatus(clientBatchId, BatchStatus.syncing);

  static Future<int> markSynced(
    String clientBatchId,
    int serverId,
    String? txHash,
  ) async {
    final db = await instance;
    return db.update(
      'batches',
      {
        'status': BatchStatus.synced.index.toString(),
        'server_id': serverId,
        'tx_hash': txHash,
      },
      where: 'client_batch_id = ?',
      whereArgs: [clientBatchId],
    );
  }

  static Future<int> markError(String clientBatchId) =>
      _updateStatus(clientBatchId, BatchStatus.error);

  static Future<int> _updateStatus(
    String clientBatchId,
    BatchStatus status,
  ) async {
    final db = await instance;
    return db.update(
      'batches',
      {'status': status.index.toString()},
      where: 'client_batch_id = ?',
      whereArgs: [clientBatchId],
    );
  }
}
