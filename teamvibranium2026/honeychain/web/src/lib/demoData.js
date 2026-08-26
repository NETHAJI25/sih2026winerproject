export const demoBatches = [
  {
    id: 'B-1042',
    status: 'packaged',
    floraType: 'Mustard',
    weightKg: 41.5,
    harvestDate: '2026-02-14',
    apiary: { name: 'Ravi Apiary, Tiruvallur', lat: 13.2299, lng: 79.9026 },
    farmer: {
      name: 'Ravi Kumar',
      story:
        'Ravi tends 8 bee boxes at the edge of his family plot in the mustard fields of Tiruvallur. When the fields turn yellow each January, the boxes fill within weeks, and he walks the rows twice a day through the bloom.',
    },
    qualityRecords: [
      {
        testType: 'NMR',
        passed: true,
        certificateHash: '0x7c1e9ab54f0d23e8c6b1a4f29d0e57aa83c2f61bd94e0a17c35b8f6d21e04c99',
        labName: 'Apex Food Testing Labs, Pune',
      },
    ],
    transfers: [
      {
        from: 'Ravi Apiary (Tiruvallur)',
        to: 'Tiruvallur FPO Collection Center',
        weightKg: 42,
        geo: 'Tiruvallur, TN',
        timestamp: '2026-02-14T06:30:00Z',
        txHash: '0x9f2c81ba64de70c15fa3b8e92d4167cc0ab53fe8d91b24a67e03c58df4a1b72e',
      },
      {
        from: 'Tiruvallur FPO Collection Center',
        to: 'HoneyPure Processing Unit, Sriperumbudur',
        weightKg: 42,
        geo: 'Sriperumbudur, TN',
        timestamp: '2026-02-16T10:15:00Z',
        txHash: '0x3ad7f0c95be2148da6cf3091e75b82fc4d6091ea27c5b8f30e94d71ac62fb105',
      },
      {
        from: 'HoneyPure Processing Unit, Sriperumbudur',
        to: 'AmberPack Packaging Facility, Chennai',
        weightKg: 41.5,
        geo: 'Chennai, TN',
        timestamp: '2026-02-20T09:00:00Z',
        txHash: '0xc41b7ee29a05d3f8610cb74a52e93fd1876b0a5cd2f49e31b7a608d5c92ef34a',
      },
      {
        from: 'AmberPack Packaging Facility, Chennai',
        to: 'Co-op Retail Depot, Anna Nagar',
        weightKg: 41.5,
        geo: 'Chennai, TN',
        timestamp: '2026-02-24T14:45:00Z',
        txHash: '0x51e08af3d69c72b4180ae5c37f2d94b6a08c1e75f30d24b97c6a153e8db04f62',
      },
    ],
  },
  {
    id: 'B-2001',
    status: 'flagged',
    floraType: 'Sunflower',
    weightKg: 42,
    harvestDate: '2026-02-10',
    apiary: { name: 'Meena Apiary, Nagapattinam', lat: 11.0624, lng: 79.8408 },
    farmer: {
      name: 'Meena Selvam',
      story:
        'Meena runs 12 boxes along the coastal sunflower plots of Nagapattinam. Her consignment was routed through a private processor after the local FPO hub hit capacity during peak season.',
    },
    qualityRecords: [
      {
        testType: 'NMR',
        passed: false,
        certificateHash: '0xb02d5f81ca37e469b5a108c73f96e2d4a51c80b7e63d29f417c5a80d3eb69f21',
        labName: 'QuickTest Diagnostics, Chennai',
      },
    ],
    transfers: [
      {
        from: 'Meena Apiary (Nagapattinam)',
        to: 'Delta FPO Hub, Thiruvarur',
        weightKg: 42,
        geo: 'Thiruvarur, TN',
        timestamp: '2026-02-11T08:10:00Z',
        txHash: '0xd83a40c1f59b627e308dac95f174b2068ce91d3fa07b542c89e6d130fa57bc84',
      },
      {
        from: 'Delta FPO Hub, Thiruvarur',
        to: 'QuickHoney Processing Unit, Thanjavur',
        weightKg: 42,
        geo: 'Thanjavur, TN',
        timestamp: '2026-02-13T11:35:00Z',
        txHash: '0x6f01ba93e7c4d2158fa0b36d59e7841c2a70f5b3d98e146c07adf52b39c68e11',
      },
      {
        from: 'QuickHoney Processing Unit, Thanjavur',
        to: 'City Wholesale Market, Koyambedu',
        weightKg: 55,
        geo: 'Chennai, TN',
        timestamp: '2026-02-19T16:20:00Z',
        txHash: '0xa57c30e81b9d462f07cae351b8d9462f017ec5a83bd204f96c31e75a8d02bf43',
      },
    ],
  },
  {
    id: 'B-1015',
    status: 'in_transit',
    floraType: 'Mustard',
    weightKg: 25,
    harvestDate: '2026-02-12',
    apiary: { name: 'Devi Apiary, Panruti', lat: 11.4239, lng: 79.5531 },
    farmer: {
      name: 'Devi Shanmugam',
      story:
        'Devi keeps 6 boxes beside her groundnut fields at Panruti and has supplied the Cuddalore FPO for four seasons without a single rejected lot.',
    },
    qualityRecords: [],
    transfers: [
      {
        from: 'Devi Apiary (Panruti)',
        to: 'Cuddalore FPO Center',
        weightKg: 25,
        geo: 'Cuddalore, TN',
        timestamp: '2026-02-12T07:45:00Z',
        txHash: '0x2b9e47c6d0f183a52be7094dc3f6a185702ed9c4b6f30a81e57c204d93b16fa0',
      },
      {
        from: 'Cuddalore FPO Center',
        to: 'HoneyPure Processing Unit (in transit)',
        weightKg: 25,
        geo: 'NH-32, Tamil Nadu',
        timestamp: '2026-02-17T05:20:00Z',
        txHash: '0xe14c8027fa5b396d0cae8173b25f94e60c8d31a75b0f24e93c67d1a5802feb49',
      },
    ],
  },
  {
    id: 'B-1027',
    status: 'received',
    floraType: 'Eucalyptus',
    weightKg: 60,
    harvestDate: '2026-01-28',
    apiary: { name: 'Marayoor Highlands Apiary', lat: 10.2833, lng: 77.1667 },
    farmer: {
      name: 'Jose Thomas',
      story:
        'Jose places 18 boxes across eucalyptus groves near Marayoor, where cool nights slow the nectar flow and concentrate the flavour.',
    },
    qualityRecords: [
      {
        testType: 'NMR',
        passed: true,
        certificateHash: '0x4e87b1c05dfa2963c7e0814bfa52d370916ce8b2a4d05f1379cb6e2408da37f5',
        labName: 'Kerala Food Analysis Lab, Kochi',
      },
    ],
    transfers: [
      {
        from: 'Marayoor Highlands Apiary',
        to: 'Munnar Hill Federation Hub',
        weightKg: 60,
        geo: 'Munnar, Kerala',
        timestamp: '2026-01-28T09:00:00Z',
        txHash: '0x88d2c05b71ea349f60cb2174ad93e50f82b61c74a09d3e58c72f1046bd95a38e',
      },
      {
        from: 'Munnar Hill Federation Hub',
        to: 'HoneyPure Processing Unit, Sriperumbudur',
        weightKg: 60,
        geo: 'Sriperumbudur, TN',
        timestamp: '2026-02-01T12:30:00Z',
        txHash: '0x07be53a19c46f280db5ae913c47f62d8091a45be30c7f26891de04a75c3fb920',
      },
    ],
  },
  {
    id: 'B-1038',
    status: 'processed',
    floraType: 'Litchi',
    weightKg: 32.8,
    harvestDate: '2026-02-05',
    apiary: { name: 'Sahni Orchards, Muzaffarpur', lat: 26.1209, lng: 85.3647 },
    farmer: {
      name: 'Anil Sahni',
      story:
        'Anil migrates his 22 boxes to litchi orchards every February, parking them between the rows for three intense weeks of bloom.',
    },
    qualityRecords: [
      {
        testType: 'NMR',
        passed: true,
        certificateHash: '0xf19a62cd308e574b209dac863f51b70e48c92a06d73b1548ce09f6a2b84d1753',
        labName: 'Food Safety Works Lab, Delhi',
      },
    ],
    transfers: [
      {
        from: 'Sahni Orchards (Muzaffarpur)',
        to: 'North India Partner Hub, Patna',
        weightKg: 33,
        geo: 'Patna, Bihar',
        timestamp: '2026-02-05T08:25:00Z',
        txHash: '0x63c0f8d24ae971b3058ec264d97a30f185b02ce64d9a713f80c4e52b6af09d71',
      },
      {
        from: 'North India Partner Hub, Patna',
        to: 'HoneyPure Processing Unit, Sriperumbudur',
        weightKg: 32.8,
        geo: 'Sriperumbudur, TN',
        timestamp: '2026-02-09T15:10:00Z',
        txHash: '0xb46e2018fc7a53d902eb8c15a643f7d290ec54b1830a62f79dc531e8b04caf66',
      },
    ],
  },
  {
    id: 'B-1050',
    status: 'packaged',
    floraType: 'Acacia',
    weightKg: 47.5,
    harvestDate: '2026-01-20',
    apiary: { name: 'Rajaji Fringe Apiary, Haridwar', lat: 30.0487, lng: 78.2605 },
    farmer: {
      name: 'Ganga Prasad',
      story:
        'Ganga Prasad sets 15 boxes along the Rajaji forest fringe, where acacia bloom gives a light, clear honey prized by city buyers.',
    },
    qualityRecords: [
      {
        testType: 'NMR',
        passed: true,
        certificateHash: '0x2d70c8a4f19e365b082dae517c93f06be48a12d7c50f3968eb1724a0d65f83c9',
        labName: 'Himalayan Food Test Services, Dehradun',
      },
    ],
    transfers: [
      {
        from: 'Rajaji Fringe Apiary, Haridwar',
        to: 'Haridwar FPO Ghat Yard',
        weightKg: 48,
        geo: 'Haridwar, Uttarakhand',
        timestamp: '2026-01-20T07:15:00Z',
        txHash: '0x9c31b7e05a68f240c1de8937b54a206fd0713ce85a9b641f30d782ce5a10bf94',
      },
      {
        from: 'Haridwar FPO Ghat Yard',
        to: 'HoneyPure Processing Unit, Sriperumbudur',
        weightKg: 48,
        geo: 'Sriperumbudur, TN',
        timestamp: '2026-01-25T13:40:00Z',
        txHash: '0x40ae96c17d3b5208fa6c173be9025d7481f0ca36e25b98d1470ac63fe5921d70',
      },
      {
        from: 'HoneyPure Processing Unit, Sriperumbudur',
        to: 'AmberPack Packaging Facility, Chennai',
        weightKg: 47.5,
        geo: 'Chennai, TN',
        timestamp: '2026-01-30T10:05:00Z',
        txHash: '0xe87f04b2c5619d3a70fbe182c495306da17b40f95c28e163a7d0b49c2ef58a03',
      },
    ],
  },
  {
    id: 'B-1031',
    status: 'created',
    floraType: 'Wild Jamun',
    weightKg: 38,
    harvestDate: '2026-02-18',
    apiary: { name: 'Siruvani Foothills Apiary', lat: 10.9587, lng: 76.7217 },
    farmer: {
      name: 'Lakshmi Priya',
      story:
        'Lakshmi placed 5 boxes near wild jamun trees on the Siruvani foothills this season and logged her first harvest directly on the ledger.',
    },
    qualityRecords: [],
    transfers: [
      {
        from: 'Lakshmi Apiary (Coimbatore)',
        to: 'Siruvani FPO Point',
        weightKg: 38,
        geo: 'Coimbatore, TN',
        timestamp: '2026-02-18T06:50:00Z',
        txHash: '0x15f8d3a90c47e26b805fac9317e4b2608d7c94f1a30e5826bc7d4091ef5a23b8',
      },
    ],
  },
  {
    id: 'B-1061',
    status: 'created',
    floraType: 'Coriander',
    weightKg: 22,
    harvestDate: '2026-02-21',
    apiary: { name: 'Tenali Fields Apiary, Guntur', lat: 16.3067, lng: 80.4365 },
    farmer: {
      name: 'Padma Rao',
      story:
        'Padma rotates 4 boxes through coriander seed fields at Tenali, a rare micro-flora honey that sells out at co-op fairs every year.',
    },
    qualityRecords: [],
    transfers: [
      {
        from: 'Tenali Fields Apiary, Guntur',
        to: 'Guntur FPO Drop Point',
        weightKg: 22,
        geo: 'Guntur, AP',
        timestamp: '2026-02-21T08:05:00Z',
        txHash: '0x76b0e5c28f14a930d67cb4821e05f39a4c8d1702be635f90a418dc72e5fb0146',
      },
    ],
  },
]

export const demoAlerts = [
  {
    id: 'AL-201',
    batchId: 'B-2001',
    type: 'dilution',
    severity: 'high',
    message:
      'Weight anomaly detected: QuickHoney Processing Unit accepted 42 kg but shipped 55 kg onward. Possible syrup dilution before dispatch.',
    payload: { inKg: 42, outKg: 55 },
    createdAt: '2026-02-19T18:05:00Z',
    acknowledged: false,
  },
  {
    id: 'AL-202',
    batchId: 'B-1015',
    type: 'disease',
    severity: 'medium',
    message:
      'Varroa mite symptoms spotted in donor colonies near Panruti. Batch held in transit pending field inspection by the district bee officer.',
    createdAt: '2026-02-17T08:40:00Z',
    acknowledged: false,
  },
  {
    id: 'AL-203',
    batchId: 'B-1038',
    type: 'disease',
    severity: 'medium',
    message:
      'Foulbrood scare reported two kilometres from partner orchards. Cleared after inspection — no hive contact with affected zone.',
    createdAt: '2026-02-06T11:20:00Z',
    acknowledged: true,
  },
]

export const demoChain = {
  connected: 'mock-mode',
  blockNumber: 1284,
  recentTransfers: 47,
}
