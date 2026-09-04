import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:http/http.dart' as http;

void main() => runApp(const HoneyChainApp());

class HoneyChainApp extends StatelessWidget {
  const HoneyChainApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HoneyChain',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFF5A623)),
          useMaterial3: true),
      home: const LauncherScreen(),
    );
  }
}

class LauncherScreen extends StatelessWidget {
  const LauncherScreen({super.key});
  static const _url = 'https://web-mocha-three-89.vercel.app/';
  Future<void> _openExternal() async {
    final uri = Uri.parse(_url);
    if (await canLaunchUrl(uri))
      await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.verified, size: 64, color: Color(0xFFF5A623)),
              const SizedBox(height: 16),
              const Text('HoneyChain',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
              const Text('Tap to open website — same as Vercel, same Firebase',
                  textAlign: TextAlign.center),
              const SizedBox(height: 24),
              FilledButton.icon(
                  onPressed: _openExternal,
                  icon: const Icon(Icons.open_in_browser),
                  label: const Text('Open in Browser (fastest)')),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const WebViewScreen())),
                icon: const Icon(Icons.web),
                label: const Text('Open inside App (WebView)'),
              ),
              const SizedBox(height: 12),
              const Text('WebView uses http fetch → no ERR_CACHE_MISS',
                  style: TextStyle(fontSize: 11, color: Colors.grey)),
            ],
          ),
        ),
      ),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});
  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _c;
  bool _loading = true;
  static const _url = 'https://web-mocha-three-89.vercel.app/';
  Future<void> _load() async {
    try {
      final r = await http.get(Uri.parse(_url));
      if (r.statusCode == 200) {
        await _c.loadHtmlString(r.body, baseUrl: _url);
        return;
      }
    } catch (_) {}
    await _c.loadRequest(Uri.parse(_url));
  }

  @override
  void initState() {
    super.initState();
    _c = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
          onPageStarted: (_) => setState(() => _loading = true),
          onPageFinished: (_) => setState(() => _loading = false)));
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('HoneyChain WebView')),
      body: Stack(children: [
        WebViewWidget(controller: _c),
        if (_loading)
          const Center(
              child: CircularProgressIndicator(color: Color(0xFFF5A623))),
      ]),
    );
  }
}
