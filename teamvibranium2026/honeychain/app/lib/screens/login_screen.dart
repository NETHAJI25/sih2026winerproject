import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/strings.dart';
import '../providers/auth_provider.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  String _role = 'beekeeper';
  bool _busy = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _enter() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty || _busy) return;
    setState(() => _busy = true);
    await context.read<AuthProvider>().login(phone, role: _role);
    if (!mounted) return;
    Navigator.of(context)
        .pushReplacement(MaterialPageRoute(builder: (_) => const HomeScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 40),
                const Text(
                  'HONEYCHAIN',
                  style: TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 6,
                    color: Color(0xFFB45309),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Offline-first harvest logging for beekeepers',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 48),
                DropdownButtonFormField<String>(
                    value: _role,
                    decoration: const InputDecoration(
                        labelText: 'Login as', border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(
                          value: 'beekeeper',
                          child: Text('Farmer — Beekeeper')),
                      DropdownMenuItem(
                          value: 'transporter', child: Text('Transport')),
                      DropdownMenuItem(
                          value: 'lab', child: Text('Lab — Testing')),
                      DropdownMenuItem(
                          value: 'packer', child: Text('Packaging')),
                      DropdownMenuItem(
                          value: 'admin', child: Text('Admin / KVIC')),
                      DropdownMenuItem(
                          value: 'customer', child: Text('Customer')),
                    ],
                    onChanged: (v) {
                      if (v != null) setState(() => _role = v);
                    }),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: S.t(S.locale, 'phone'),
                    prefixIcon: const Icon(Icons.phone),
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: FilledButton(
                    onPressed: _busy ? null : _enter,
                    child: _busy
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(S.t(S.locale, 'enter')),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
