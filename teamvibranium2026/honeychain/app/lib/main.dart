import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'l10n/strings.dart';
import 'providers/auth_provider.dart';
import 'providers/sync_provider.dart';
import 'screens/login_screen.dart';

final ValueNotifier<String> localeNotifier = ValueNotifier<String>('en');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final saved = prefs.getString('hc_locale') ?? 'en';
  S.locale = saved;
  localeNotifier.value = saved;
  runApp(const HoneyChainApp());
}

class HoneyChainApp extends StatefulWidget {
  const HoneyChainApp({super.key});

  @override
  State<HoneyChainApp> createState() => _HoneyChainAppState();
}

class _HoneyChainAppState extends State<HoneyChainApp> {
  String _locale = 'en';

  @override
  void initState() {
    super.initState();
    localeNotifier.addListener(() {
      if (!mounted) return;
      setState(() => _locale = localeNotifier.value);
    });
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => SyncProvider()),
      ],
      child: MaterialApp(
        title: S.t(_locale, 'appName'),
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFB45309)),
        ),
        home: const LoginScreen(),
      ),
    );
  }
}
