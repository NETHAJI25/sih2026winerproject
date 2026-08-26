import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../l10n/strings.dart';
import '../models/batch.dart';
import '../models/hive.dart';
import '../providers/sync_provider.dart';
import '../services/db.dart';
import '../services/location.dart';

const List<String> _floraOptions = [
  'Mustard',
  'Eucalyptus',
  'Lychee',
  'Sunflower',
  'Wild',
];

class NewHarvestScreen extends StatefulWidget {
  const NewHarvestScreen({super.key});

  @override
  State<NewHarvestScreen> createState() => _NewHarvestScreenState();
}

class _NewHarvestScreenState extends State<NewHarvestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _weightController = TextEditingController();
  final _picker = ImagePicker();
  List<Hive> _hives = const [];
  Hive? _selectedHive;
  String _flora = _floraOptions.first;
  String? _photoPath;
  String? _photoName;
  ({double lat, double lng})? _position;
  bool _locating = false;

  @override
  void initState() {
    super.initState();
    _loadHives();
  }

  @override
  void dispose() {
    _weightController.dispose();
    super.dispose();
  }

  Future<void> _loadHives() async {
    final hives = await Db.getHives();
    if (!mounted) return;
    setState(() {
      _hives = hives;
      _selectedHive = hives.isEmpty ? null : hives.first;
    });
  }

  Future<void> _takePhoto() async {
    try {
      final xfile = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1280,
        imageQuality: 70,
      );
      if (!mounted) return;
      setState(() {
        _photoPath = xfile?.path;
        _photoName = xfile?.name;
      });
    } catch (_) {}
  }

  Future<void> _captureLocation() async {
    setState(() => _locating = true);
    final pos = await LocationService.getCurrentPosition();
    if (!mounted) return;
    setState(() {
      _position = pos;
      _locating = false;
    });
  }

  Future<void> _save() async {
    final hive = _selectedHive;
    final weight = double.tryParse(_weightController.text.trim());
    if (!_formKey.currentState!.validate() || hive == null || weight == null) {
      return;
    }
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    final batch = Batch(
      clientBatchId: Batch.newClientBatchId(),
      hiveName: hive.name,
      weightKg: weight,
      floraType: _flora,
      photoPath: _photoPath,
      geoLat: _position?.lat,
      geoLng: _position?.lng,
      harvestDate: DateTime.now(),
    );
    await Db.insertBatch(batch);
    context.read<SyncProvider>().refreshQueuedCount();
    messenger.showSnackBar(
      SnackBar(content: Text(S.t(S.locale, 'savedOffline'))),
    );
    navigator.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(S.t(S.locale, 'newHarvest'))),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_hives.isEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(
                  'No hives yet. Add one from the Hives tab first.',
                  style: TextStyle(color: Colors.orange.shade900),
                ),
              )
            else
              DropdownButtonFormField<Hive>(
                value: _selectedHive,
                decoration: InputDecoration(
                  labelText: S.t(S.locale, 'myHives'),
                  border: const OutlineInputBorder(),
                ),
                items: [
                  for (final h in _hives)
                    DropdownMenuItem(value: h, child: Text(h.name)),
                ],
                onChanged: (h) => setState(() => _selectedHive = h),
              ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _weightController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: S.t(S.locale, 'weightHint'),
                border: const OutlineInputBorder(),
              ),
              validator: (v) =>
                  double.tryParse(v ?? '') == null ? 'Required number' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _flora,
              decoration: const InputDecoration(
                labelText: 'Flora type',
                border: OutlineInputBorder(),
              ),
              items: [
                for (final f in _floraOptions)
                  DropdownMenuItem(value: f, child: Text(f)),
              ],
              onChanged: (f) {
                if (f != null) setState(() => _flora = f);
              },
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                OutlinedButton.icon(
                  onPressed: _takePhoto,
                  icon: const Icon(Icons.photo_camera),
                  label: Text(S.t(S.locale, 'photo')),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _photoName ?? 'None',
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                OutlinedButton.icon(
                  onPressed: _locating ? null : _captureLocation,
                  icon: const Icon(Icons.my_location),
                  label: Text(S.t(S.locale, 'location')),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _locating
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(
                          _position == null
                              ? 'Not captured'
                              : '${_position!.lat.toStringAsFixed(5)}, ${_position!.lng.toStringAsFixed(5)}',
                        ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 52,
              child: FilledButton.icon(
                onPressed: _save,
                icon: const Icon(Icons.save),
                label: Text(S.t(S.locale, 'saveOffline')),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              S.t(S.locale, 'yieldTip'),
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
            ),
          ],
        ),
      ),
    );
  }
}
