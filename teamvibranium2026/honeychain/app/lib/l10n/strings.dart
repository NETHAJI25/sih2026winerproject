class S {
  static String locale = 'en';

  static const Map<String, Map<String, String>> _t = {
    'en': {
      'appName': 'HoneyChain',
      'phone': 'Phone number',
      'enter': 'Enter',
      'myHives': 'My Hives',
      'addHive': 'Add Hive',
      'newHarvest': 'New Harvest',
      'saveOffline': 'Save Offline',
      'savedOffline':
          'Saved offline. Will sync automatically when back online.',
      'batches': 'Batches',
      'syncNow': 'Sync Now',
      'syncing': 'Syncing…',
      'queued': 'Queued',
      'synced': 'Synced',
      'error': 'Error',
      'settings': 'Settings',
      'language': 'Language',
      'logout': 'Logout',
      'weightHint': 'Weight (kg)',
      'photo': 'Photo',
      'location': 'Location',
      'diseaseAlert': 'Disease alert: inspect hives for foulbrood symptoms.',
      'yieldTip': 'Tip: harvest after sunny days for better yield.',
    },
    'hi': {
      'appName': 'HoneyChain',
      'phone': 'फ़ोन नंबर',
      'enter': 'दर्ज करें',
      'myHives': 'मेरे छत्ते',
      'addHive': 'छत्ता जोड़ें',
      'newHarvest': 'नई कटाई',
      'saveOffline': 'ऑफ़लाइन सेव करें',
      'savedOffline': 'ऑफ़लाइन सेव हो गया। ऑनलाइन आने पर अपने आप सिंक होगा।',
      'batches': 'बैच',
      'syncNow': 'अभी सिंक करें',
      'syncing': 'सिंक हो रहा है…',
      'queued': 'कतार में',
      'synced': 'सिंक हो गया',
      'error': 'त्रुटि',
      'settings': 'सेटिंग्स',
      'language': 'भाषा',
      'logout': 'लॉग आउट',
      'weightHint': 'वज़न (किग्रा)',
      'photo': 'फ़ोटो',
      'location': 'स्थान',
      'diseaseAlert':
          'रोग चेतावनी: फाउलब्रूड के लक्षणों के लिए छत्तों की जाँच करें।',
      'yieldTip': 'सुझाव: बेहतर उपज के लिए धूप वाले दिनों के बाद कटाई करें।',
    },
    'ta': {
      'appName': 'HoneyChain',
      'phone': 'கைபேசி எண்',
      'enter': 'உள்ளிடு',
      'myHives': 'என் தேனீக் கூடுகள்',
      'addHive': 'கூடு சேர்',
      'newHarvest': 'புதிய அறுவடை',
      'saveOffline': 'ஆஃப்லைனில் சேமி',
      'savedOffline':
          'ஆஃப்லைனில் சேமிக்கப்பட்டது. இணையம் கிடைக்கும்போது தானாக ஒத்திசையும்.',
      'batches': 'தொகுதிகள்',
      'syncNow': 'இப்போது ஒத்திசை',
      'syncing': 'ஒத்திசைக்கிறது…',
      'queued': 'வரிசையில்',
      'synced': 'ஒத்திசைந்தது',
      'error': 'பிழை',
      'settings': 'அமைப்புகள்',
      'language': 'மொழி',
      'logout': 'வெளியேறு',
      'weightHint': 'எடை (கிலோ)',
      'photo': 'புகைப்படம்',
      'location': 'இடம்',
      'diseaseAlert':
          'நோய் எச்சரிக்கை: ஃபவுல்ப்ரூட் அறிகுறிகளுக்கு கூடுகளை ஆய்வு செய்யவும்.',
      'yieldTip':
          'குறிப்பு: நல்ல விளைச்சலுக்கு வெயில் நாட்களுக்குப் பிறகு அறுவடை செய்யவும்.',
    },
  };

  static String t(String localeKey, String key) =>
      _t[localeKey]?[key] ?? _t['en']![key] ?? key;
}
