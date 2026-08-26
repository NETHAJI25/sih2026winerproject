import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/strings.dart';
import '../main.dart';
import '../providers/sync_provider.dart';
import 'batches_screen.dart';
import 'hives_screen.dart';
import 'settings_screen.dart';
import 'sync_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<SyncProvider>().refreshQueuedCount();
    });
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: localeNotifier,
      builder: (context, locale, _) {
        const pages = [
          HivesScreen(),
          BatchesScreen(),
          SyncScreen(),
          SettingsScreen(),
        ];
        return Scaffold(
          appBar: AppBar(
            title: Text(S.t(locale, 'appName')),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Consumer<SyncProvider>(
                  builder: (context, sync, _) {
                    final pending = sync.queuedCount > 0;
                    final color = pending
                        ? Colors.orange.shade800
                        : Colors.green.shade700;
                    return Chip(
                      avatar: Icon(
                        pending ? Icons.cloud_off : Icons.cloud_done,
                        size: 16,
                        color: color,
                      ),
                      label: Text(
                        '${sync.queuedCount}',
                        style: TextStyle(
                          color: color,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      visualDensity: VisualDensity.compact,
                      backgroundColor: color.withOpacity(0.12),
                    );
                  },
                ),
              ),
            ],
          ),
          body: IndexedStack(index: _tab, children: pages),
          bottomNavigationBar: BottomNavigationBar(
            type: BottomNavigationBarType.fixed,
            currentIndex: _tab,
            onTap: (i) => setState(() => _tab = i),
            selectedItemColor: const Color(0xFFB45309),
            items: [
              BottomNavigationBarItem(
                icon: const Icon(Icons.inventory_2_outlined),
                activeIcon: const Icon(Icons.inventory_2),
                label: S.t(locale, 'myHives'),
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.receipt_long_outlined),
                activeIcon: const Icon(Icons.receipt_long),
                label: S.t(locale, 'batches'),
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.sync_outlined),
                activeIcon: const Icon(Icons.sync),
                label: S.t(locale, 'syncNow'),
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.settings_outlined),
                activeIcon: const Icon(Icons.settings),
                label: S.t(locale, 'settings'),
              ),
            ],
          ),
        );
      },
    );
  }
}
