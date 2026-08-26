import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../l10n/strings.dart';
import '../main.dart';
import '../providers/auth_provider.dart';
import '../services/api.dart';
import 'login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final TextEditingController _baseUrlController;

  @override
  void initState() {
    super.initState();
    _baseUrlController = TextEditingController(text: ApiClient.baseUrl);
  }

  @override
  void dispose() {
    _baseUrlController.dispose();
    super.dispose();
  }

  Future<void> _changeLocale(String value) async {
    setState(() {
      S.locale = value;
      localeNotifier.value = value;
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('hc_locale', value);
  }

  Future<void> _logout() async {
    final navigator = Navigator.of(context);
    final auth = context.read<AuthProvider>();
    await auth.logout();
    navigator.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          S.t(S.locale, 'language'),
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        RadioListTile<String>(
          value: 'en',
          groupValue: S.locale,
          title: const Text('English'),
          onChanged: (v) {
            if (v != null) _changeLocale(v);
          },
        ),
        RadioListTile<String>(
          value: 'hi',
          groupValue: S.locale,
          title: const Text('हिंदी'),
          onChanged: (v) {
            if (v != null) _changeLocale(v);
          },
        ),
        RadioListTile<String>(
          value: 'ta',
          groupValue: S.locale,
          title: const Text('தமிழ்'),
          onChanged: (v) {
            if (v != null) _changeLocale(v);
          },
        ),
        const Divider(),
        const Text('Server URL', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextField(
          controller: _baseUrlController,
          keyboardType: TextInputType.url,
          decoration: const InputDecoration(
            hintText: 'http://10.0.2.2:4000',
            border: OutlineInputBorder(),
          ),
          onChanged: (v) => ApiClient.baseUrl = v.trim(),
        ),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.logout, color: Colors.redAccent),
          title: Text(S.t(S.locale, 'logout')),
          onTap: _logout,
        ),
      ],
    );
  }
}
