import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Actor {
  final String name;
  final String phone;
  final String role;

  const Actor({required this.name, required this.phone, required this.role});

  Map<String, dynamic> toJson() => {'name': name, 'phone': phone, 'role': role};

  factory Actor.fromJson(Map<String, dynamic> json) => Actor(
    name: (json['name'] as String?) ?? '',
    phone: (json['phone'] as String?) ?? '',
    role: (json['role'] as String?) ?? 'beekeeper',
  );
}

class AuthProvider extends ChangeNotifier {
  static const _prefsKey = 'hc_actor';
  Actor? _actor;

  Actor? get actor => _actor;
  bool get isLoggedIn => _actor != null;

  AuthProvider() {
    _restore();
  }

  Future<void> login(String phone) async {
    _actor = Actor(name: 'Ravi Kumar', phone: phone, role: 'beekeeper');
    await _persist();
    notifyListeners();
  }

  Future<void> logout() async {
    _actor = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefsKey);
    notifyListeners();
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, jsonEncode(_actor!.toJson()));
  }

  Future<void> _restore() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_prefsKey);
      if (raw == null) return;
      _actor = Actor.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      notifyListeners();
    } catch (_) {
      _actor = null;
    }
  }
}
