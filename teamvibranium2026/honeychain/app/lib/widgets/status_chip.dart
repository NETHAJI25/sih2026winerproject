import 'package:flutter/material.dart';

import '../l10n/strings.dart';
import '../models/batch.dart';

class StatusChip extends StatelessWidget {
  final BatchStatus status;

  const StatusChip({super.key, required this.status});

  Color get _color {
    switch (status) {
      case BatchStatus.queued:
        return Colors.orange.shade700;
      case BatchStatus.syncing:
        return Colors.blue.shade600;
      case BatchStatus.synced:
        return Colors.green.shade600;
      case BatchStatus.error:
        return Colors.red.shade600;
    }
  }

  String get _label {
    final key = switch (status) {
      BatchStatus.queued => 'queued',
      BatchStatus.syncing => 'syncing',
      BatchStatus.synced => 'synced',
      BatchStatus.error => 'error',
    };
    return S.t(S.locale, key);
  }

  @override
  Widget build(BuildContext context) {
    final color = _color;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.14),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color),
      ),
      child: Text(
        _label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
