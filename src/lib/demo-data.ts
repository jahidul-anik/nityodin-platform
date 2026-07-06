// Demo data module for Nityodin Platform
// Used as fallback when database is unavailable (e.g., Vercel serverless without Turso)

// ============ SHARED REFERENCES ============

const USER_IDS = {
  rahim: 'demo_user_rahim_001',
  fatema: 'demo_user_fatema_002',
  karim: 'demo_user_karim_003',
  jamal: 'demo_user_jamal_004',
  nasreen: 'demo_user_nasreen_005',
  abdul: 'demo_user_abdul_006',
};

const WALLET_IDS = {
  rahim: 'demo_wallet_rahim_001',
  fatema: 'demo_wallet_fatema_002',
  karim: 'demo_wallet_karim_003',
  jamal: 'demo_wallet_jamal_004',
  nasreen: 'demo_wallet_nasreen_005',
  abdul: 'demo_wallet_abdul_006',
};

const PRODUCT_IDS = {
  basmatiRice: 'demo_prod_basmati_001',
  milk: 'demo_prod_milk_002',
  dal: 'demo_prod_dal_003',
  saree: 'demo_prod_saree_004',
  panjabi: 'demo_prod_panjabi_005',
  coconutOil: 'demo_prod_coconut_006',
  hilsha: 'demo_prod_hilsha_007',
  honey: 'demo_prod_honey_008',
};

const DOCTOR_IDS = {
  amina: 'demo_doc_amina_001',
  kamal: 'demo_doc_kamal_002',
  shirin: 'demo_doc_shirin_003',
  tanvir: 'demo_doc_tanvir_004',
  nasima: 'demo_doc_nasima_005',
  rafiqul: 'demo_doc_rafiqul_006',
};

const SERVICE_IDS = {
  electrical: 'demo_svc_electrical_001',
  ac: 'demo_svc_ac_002',
  plumbing: 'demo_svc_plumbing_003',
  photography: 'demo_svc_photo_004',
  autoRepair: 'demo_svc_auto_005',
  beauty: 'demo_svc_beauty_006',
};

// ============ PLATFORM STATS ============

export const demoPlatformStats = {
  totalUsers: 12847,
  totalMerchants: 843,
  totalProducts: 5621,
  totalOrders: 18432,
  totalTransactions: 18432,
  walletBalance: 42560000,
  activeServices: 326,
  doctorsAvailable: 148,
  farmProducts: 892,
  totalLocations: 1247,
};

// ============ USER (me) ============

const userRoles = [
  { id: 'demo_role_001', userId: USER_IDS.rahim, role: 'consumer', isActive: true, createdAt: '2024-11-15T06:00:00.000Z' },
  { id: 'demo_role_002', userId: USER_IDS.rahim, role: 'merchant', isActive: true, createdAt: '2024-11-15T06:00:00.000Z' },
];

const walletTransactions = [
  { id: 'demo_tx_001', walletId: WALLET_IDS.rahim, type: 'credit', amount: 500000, description: 'Funded via bKash', paymentMethod: 'bKash', referenceType: 'funding', referenceId: null, status: 'completed', createdAt: '2025-01-18T09:30:00.000Z' },
  { id: 'demo_tx_002', walletId: WALLET_IDS.rahim, type: 'debit', amount: 45000, description: 'Order #ORD001', paymentMethod: 'wallet', referenceType: 'order', referenceId: 'ORD001', status: 'completed', createdAt: '2025-01-17T14:20:00.000Z' },
  { id: 'demo_tx_003', walletId: WALLET_IDS.rahim, type: 'credit', amount: 12500, description: 'Refund - cancelled order', paymentMethod: 'wallet', referenceType: 'order', referenceId: null, status: 'completed', createdAt: '2025-01-16T11:45:00.000Z' },
  { id: 'demo_tx_004', walletId: WALLET_IDS.rahim, type: 'transfer', amount: 50000, description: 'P2P Transfer to Fatema', paymentMethod: 'wallet', referenceType: 'p2p', referenceId: null, status: 'completed', createdAt: '2025-01-15T16:00:00.000Z' },
  { id: 'demo_tx_005', walletId: WALLET_IDS.rahim, type: 'debit', amount: 85000, description: 'Service: Electrical Repair', paymentMethod: 'wallet', referenceType: 'service', referenceId: null, status: 'completed', createdAt: '2025-01-15T10:30:00.000Z' },
  { id: 'demo_tx_006', walletId: WALLET_IDS.rahim, type: 'credit', amount: 200000, description: 'Funded via Nagad', paymentMethod: 'Nagad', referenceType: 'funding', referenceId: null, status: 'completed', createdAt: '2025-01-14T08:00:00.000Z' },
  { id: 'demo_tx_007', walletId: WALLET_IDS.rahim, type: 'escrow_hold', amount: 30000, description: 'Service Payment Hold', paymentMethod: 'wallet', referenceType: 'service', referenceId: null, status: 'completed', createdAt: '2025-01-13T13:15:00.000Z' },
  { id: 'demo_tx_008', walletId: WALLET_IDS.rahim, type: 'debit', amount: 120000, description: 'Order - Fresh Hilsha Fish', paymentMethod: 'wallet', referenceType: 'order', referenceId: null, status: 'completed', createdAt: '2025-01-12T19:45:00.000Z' },
  { id: 'demo_tx_009', walletId: WALLET_IDS.rahim, type: 'credit', amount: 500000, description: 'Funded via Rocket', paymentMethod: 'Rocket', referenceType: 'funding', referenceId: null, status: 'completed', createdAt: '2025-01-10T07:30:00.000Z' },
  { id: 'demo_tx_010', walletId: WALLET_IDS.rahim, type: 'debit', amount: 150000, description: 'Order - Pure Cotton Panjabi', paymentMethod: 'wallet', referenceType: 'order', referenceId: null, status: 'completed', createdAt: '2025-01-08T15:20:00.000Z' },
];

export const demoUserMe = {
  user: {
    id: USER_IDS.rahim,
    phone: '+8801712345678',
    email: 'rahim@example.com',
    name: 'Rahim Uddin',
    avatarUrl: null,
    dateOfBirth: null,
    gender: 'male',
    city: 'Dhaka',
    district: 'Dhaka',
    division: 'Dhaka',
    isPhoneVerified: true,
    isNidVerified: true,
    createdAt: '2024-11-15T06:00:00.000Z',
  },
  roles: userRoles,
  wallet: {
    id: WALLET_IDS.rahim,
    balance: 4560000,
    isFrozen: false,
  },
  recentTransactions: walletTransactions.slice(0, 5),
};

// ============ PRODUCTS ============

export const demoProducts = [
  { id: PRODUCT_IDS.honey, sellerId: USER_IDS.nasreen, name: 'Organic Honey (Sundarbans)', nameBn: 'সুন্দরবনের মধু', description: 'Pure organic honey collected from Sundarbans mangrove forest.', price: 180000, category: 'grocery', subcategory: 'honey', imageUrl: '', stock: 50, unit: 'kg', rating: 4.9, reviewCount: 91, isActive: true, createdAt: '2025-01-20T10:00:00.000Z', updatedAt: '2025-01-20T10:00:00.000Z', seller: { id: USER_IDS.nasreen, name: 'Nasreen Akter', avatarUrl: null } },
  { id: PRODUCT_IDS.hilsha, sellerId: USER_IDS.nasreen, name: 'Fresh Hilsha Fish', nameBn: 'তাজা ইলিশ মাছ', description: 'Fresh Padma river Hilsha. Perfect for special occasions.', price: 120000, category: 'grocery', subcategory: 'fish', imageUrl: '', stock: 30, unit: 'kg', rating: 4.4, reviewCount: 34, isActive: true, createdAt: '2025-01-19T10:00:00.000Z', updatedAt: '2025-01-19T10:00:00.000Z', seller: { id: USER_IDS.nasreen, name: 'Nasreen Akter', avatarUrl: null } },
  { id: PRODUCT_IDS.coconutOil, sellerId: USER_IDS.nasreen, name: 'Organic Virgin Coconut Oil', nameBn: 'অর্গানিক ভার্জিন নারিকেল তেল', description: 'Cold-pressed virgin coconut oil from Barisal. Multi-purpose use.', price: 9500, category: 'grocery', subcategory: 'oil', imageUrl: '', stock: 300, unit: 'liter', rating: 4.7, reviewCount: 65, isActive: true, createdAt: '2025-01-18T10:00:00.000Z', updatedAt: '2025-01-18T10:00:00.000Z', seller: { id: USER_IDS.nasreen, name: 'Nasreen Akter', avatarUrl: null } },
  { id: PRODUCT_IDS.panjabi, sellerId: USER_IDS.nasreen, name: 'Pure Cotton Panjabi', nameBn: 'খাঁটি সুতি পাঞ্জাবি', description: 'Premium cotton panjabi for men. Comfortable for daily wear and occasions.', price: 350000, category: 'fashion', subcategory: 'men', imageUrl: '', stock: 25, unit: 'piece', rating: 4.6, reviewCount: 42, isActive: true, createdAt: '2025-01-17T10:00:00.000Z', updatedAt: '2025-01-17T10:00:00.000Z', seller: { id: USER_IDS.nasreen, name: 'Nasreen Akter', avatarUrl: null } },
  { id: PRODUCT_IDS.saree, sellerId: USER_IDS.nasreen, name: 'Luxury Saree Collection', nameBn: 'লাক্সারি শাড়ি কালেকশন', description: 'Handcrafted Jamdani saree from Narayanganj. Traditional Bengali heritage.', price: 850000, category: 'fashion', subcategory: 'saree', imageUrl: '', stock: 12, unit: 'piece', rating: 4.9, reviewCount: 87, isActive: true, createdAt: '2025-01-16T10:00:00.000Z', updatedAt: '2025-01-16T10:00:00.000Z', seller: { id: USER_IDS.nasreen, name: 'Nasreen Akter', avatarUrl: null } },
  { id: PRODUCT_IDS.dal, sellerId: USER_IDS.rahim, name: 'Organic Dal (Masoor)', nameBn: 'জৈব মসুর ডাল', description: 'Organic red lentils sourced from Rajshahi farmers. High protein content.', price: 15000, category: 'grocery', subcategory: 'pulses', imageUrl: '', stock: 80, unit: 'kg', rating: 4.3, reviewCount: 18, isActive: true, createdAt: '2025-01-15T10:00:00.000Z', updatedAt: '2025-01-15T10:00:00.000Z', seller: { id: USER_IDS.rahim, name: 'Rahim Uddin', avatarUrl: null } },
  { id: PRODUCT_IDS.milk, sellerId: USER_IDS.rahim, name: 'Fresh Milk (Dairy Pure)', nameBn: 'তাজা দুধ', description: 'Farm-fresh pasteurized cow milk. No preservatives added.', price: 8500, category: 'grocery', subcategory: 'dairy', imageUrl: '', stock: 200, unit: 'liter', rating: 4.8, reviewCount: 56, isActive: true, createdAt: '2025-01-14T10:00:00.000Z', updatedAt: '2025-01-14T10:00:00.000Z', seller: { id: USER_IDS.rahim, name: 'Rahim Uddin', avatarUrl: null } },
  { id: PRODUCT_IDS.basmatiRice, sellerId: USER_IDS.rahim, name: 'Premium Basmati Rice', nameBn: 'প্রিমিয়াম বাসমতি চাল', description: 'Aged premium basmati rice from Dinajpur. Perfect for biryani and pulao.', price: 12000, category: 'grocery', subcategory: 'rice', imageUrl: '', stock: 150, unit: 'kg', rating: 4.5, reviewCount: 23, isActive: true, createdAt: '2025-01-13T10:00:00.000Z', updatedAt: '2025-01-13T10:00:00.000Z', seller: { id: USER_IDS.rahim, name: 'Rahim Uddin', avatarUrl: null } },
];

// ============ ORDERS ============

export const demoOrders = [
  {
    id: 'demo_order_003', buyerId: USER_IDS.rahim, sellerId: USER_IDS.nasreen, totalAmount: 129500,
    status: 'preparing', paymentStatus: 'paid', paymentMethod: 'wallet', deliveryType: 'home_delivery',
    deliveryAddress: '45 Dhanmondi 27, Dhaka', createdAt: '2025-01-20T12:00:00.000Z', updatedAt: '2025-01-20T12:00:00.000Z',
    seller: { id: USER_IDS.nasreen, name: 'Nasreen Akter', avatarUrl: null },
    items: [
      { id: 'demo_oi_005', orderId: 'demo_order_003', productId: PRODUCT_IDS.hilsha, quantity: 1, price: 120000, product: { id: PRODUCT_IDS.hilsha, name: 'Fresh Hilsha Fish', imageUrl: '' } },
      { id: 'demo_oi_006', orderId: 'demo_order_003', productId: PRODUCT_IDS.coconutOil, quantity: 1, price: 9500, product: { id: PRODUCT_IDS.coconutOil, name: 'Organic Virgin Coconut Oil', imageUrl: '' } },
    ],
  },
  {
    id: 'demo_order_002', buyerId: USER_IDS.fatema, sellerId: USER_IDS.nasreen, totalAmount: 850000,
    status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'Nagad', deliveryType: 'pickup',
    deliveryAddress: null, createdAt: '2025-01-17T09:00:00.000Z', updatedAt: '2025-01-17T09:00:00.000Z',
    seller: { id: USER_IDS.nasreen, name: 'Nasreen Akter', avatarUrl: null },
    items: [
      { id: 'demo_oi_003', orderId: 'demo_order_002', productId: PRODUCT_IDS.saree, quantity: 1, price: 850000, product: { id: PRODUCT_IDS.saree, name: 'Luxury Saree Collection', imageUrl: '' } },
    ],
  },
  {
    id: 'demo_order_001', buyerId: USER_IDS.fatema, sellerId: USER_IDS.rahim, totalAmount: 28500,
    status: 'delivered', paymentStatus: 'paid', paymentMethod: 'wallet', deliveryType: 'home_delivery',
    deliveryAddress: '12/A GEC Circle, Chittagong', createdAt: '2025-01-15T14:00:00.000Z', updatedAt: '2025-01-18T10:00:00.000Z',
    seller: { id: USER_IDS.rahim, name: 'Rahim Uddin', avatarUrl: null },
    items: [
      { id: 'demo_oi_001', orderId: 'demo_order_001', productId: PRODUCT_IDS.basmatiRice, quantity: 2, price: 12000, product: { id: PRODUCT_IDS.basmatiRice, name: 'Premium Basmati Rice', imageUrl: '' } },
      { id: 'demo_oi_002', orderId: 'demo_order_001', productId: PRODUCT_IDS.dal, quantity: 1, price: 15000, product: { id: PRODUCT_IDS.dal, name: 'Organic Dal (Masoor)', imageUrl: '' } },
    ],
  },
];

// ============ WALLET ============

export const demoWallet = {
  id: WALLET_IDS.rahim,
  balance: 4560000,
  isFrozen: false,
  transactions: walletTransactions,
};

// ============ FARM PRODUCTS ============

export const demoFarmProducts = [
  { id: 'demo_farm_005', farmerId: USER_IDS.karim, name: 'Mustard Oil (Cold Pressed)', nameBn: 'সরিষার তেল (ঘানিভাঙ্গা)', description: 'Traditional cold-pressed mustard oil. Pure and natural.', price: 18000, unit: 'liter', category: 'oil_seeds', imageUrl: '', quantity: 300, origin: 'Rajshahi', isOrganic: true, harvestDate: '2025-01-05', isActive: true, createdAt: '2025-01-20T10:00:00.000Z', updatedAt: '2025-01-20T10:00:00.000Z', farmer: { id: USER_IDS.karim, name: 'Karim Hossain', city: 'Rajshahi', avatarUrl: null } },
  { id: 'demo_farm_004', farmerId: USER_IDS.karim, name: 'Red Spinach (Lal Shak)', nameBn: 'লাল শাক', description: 'Fresh organic red spinach. Rich in iron and vitamins.', price: 2000, unit: 'kg', category: 'vegetables', imageUrl: '', quantity: 100, origin: 'Rajshahi', isOrganic: true, harvestDate: '2025-01-18', isActive: true, createdAt: '2025-01-18T10:00:00.000Z', updatedAt: '2025-01-18T10:00:00.000Z', farmer: { id: USER_IDS.karim, name: 'Karim Hossain', city: 'Rajshahi', avatarUrl: null } },
  { id: 'demo_farm_003', farmerId: USER_IDS.karim, name: 'Fresh Mangoes (Langra)', nameBn: 'তাজা ল্যাংড়া আম', description: 'Premium Langra mangoes from Chapainawabganj. Sweet and juicy.', price: 8000, unit: 'kg', category: 'fruits', imageUrl: '', quantity: 200, origin: 'Chapainawabganj', isOrganic: false, harvestDate: '2025-05-20', isActive: true, createdAt: '2025-01-17T10:00:00.000Z', updatedAt: '2025-01-17T10:00:00.000Z', farmer: { id: USER_IDS.karim, name: 'Karim Hossain', city: 'Rajshahi', avatarUrl: null } },
  { id: 'demo_farm_002', farmerId: USER_IDS.karim, name: 'Organic Potatoes', nameBn: 'জৈব আলু', description: 'Fresh organic potatoes from Rangpur. Great for curries.', price: 3000, unit: 'kg', category: 'vegetables', imageUrl: '', quantity: 1200, origin: 'Rangpur', isOrganic: true, harvestDate: '2025-01-10', isActive: true, createdAt: '2025-01-15T10:00:00.000Z', updatedAt: '2025-01-15T10:00:00.000Z', farmer: { id: USER_IDS.karim, name: 'Karim Hossain', city: 'Rajshahi', avatarUrl: null } },
  { id: 'demo_farm_001', farmerId: USER_IDS.karim, name: 'Premium Aman Rice', nameBn: 'প্রিমিয়াম আমন ধান', description: 'Freshly harvested Aman rice from Rajshahi. High quality, organic.', price: 5500, unit: 'kg', category: 'rice', imageUrl: '', quantity: 500, origin: 'Rajshahi', isOrganic: true, harvestDate: '2024-12-15', isActive: true, createdAt: '2025-01-13T10:00:00.000Z', updatedAt: '2025-01-13T10:00:00.000Z', farmer: { id: USER_IDS.karim, name: 'Karim Hossain', city: 'Rajshahi', avatarUrl: null } },
];

// ============ MARKET PRICES ============

export const demoMarketPrices = [
  { id: 'demo_mp_001', commodity: 'Eggs (per dozen)', price: 15000, unit: 'dozen', change: 2.4, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_002', commodity: 'Green Chili', price: 8000, unit: 'kg', change: 6.5, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_003', commodity: 'Mustard Oil', price: 18000, unit: 'kg', change: 0.5, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_004', commodity: 'Milk (per liter)', price: 8500, unit: 'liter', change: 0.0, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_005', commodity: 'Onion', price: 4500, unit: 'kg', change: 3.2, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_006', commodity: 'Potato', price: 3000, unit: 'kg', change: -5.3, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_007', commodity: 'Rice (Aman)', price: 5500, unit: 'kg', change: 1.5, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_008', commodity: 'Rice (Miniket)', price: 6500, unit: 'kg', change: -2.1, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_009', commodity: 'Soybean Oil', price: 15500, unit: 'kg', change: -0.3, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_010', commodity: 'Sugar', price: 12000, unit: 'kg', change: 1.0, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_011', commodity: 'Tomato', price: 4000, unit: 'kg', change: -1.8, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
  { id: 'demo_mp_012', commodity: 'Wheat Flour', price: 5800, unit: 'kg', change: 0.8, date: '2025-01-20', market: 'Kawran Bazar', createdAt: '2025-01-20T06:00:00.000Z' },
];

// ============ SERVICES ============

export const demoServices = [
  { id: SERVICE_IDS.beauty, providerId: USER_IDS.abdul, name: 'Home Beauty Service', nameBn: 'হোম বিউটি সার্ভিস', description: 'Professional beauty services at your doorstep. Bridal, party makeup, and hair styling.', category: 'business', subcategory: 'beauty', priceType: 'fixed', basePrice: 25000, imageUrl: '', rating: 4.4, reviewCount: 22, isAvailable: true, serviceType: 'at_customer', createdAt: '2025-01-20T10:00:00.000Z', updatedAt: '2025-01-20T10:00:00.000Z', provider: { id: USER_IDS.abdul, name: 'Abdul Rahman', avatarUrl: null, city: 'Sylhet' } },
  { id: SERVICE_IDS.autoRepair, providerId: USER_IDS.abdul, name: 'Auto Repair & Diagnostics', nameBn: 'অটো মেরামত ও ডায়াগনস্টিক্স', description: 'Complete car and motorcycle repair. Computerized diagnostics available.', category: 'business', subcategory: 'auto_repair', priceType: 'quote', basePrice: 30000, imageUrl: '', rating: 4.6, reviewCount: 38, isAvailable: true, serviceType: 'in_venue', createdAt: '2025-01-19T10:00:00.000Z', updatedAt: '2025-01-19T10:00:00.000Z', provider: { id: USER_IDS.abdul, name: 'Abdul Rahman', avatarUrl: null, city: 'Sylhet' } },
  { id: SERVICE_IDS.photography, providerId: USER_IDS.abdul, name: 'Professional Photography', nameBn: 'প্রফেশনাল ফটোগ্রাফি', description: 'Wedding, event, and portrait photography. Includes editing and delivery.', category: 'business', subcategory: 'photography', priceType: 'fixed', basePrice: 150000, imageUrl: '', rating: 4.9, reviewCount: 45, isAvailable: true, serviceType: 'both', createdAt: '2025-01-18T10:00:00.000Z', updatedAt: '2025-01-18T10:00:00.000Z', provider: { id: USER_IDS.abdul, name: 'Abdul Rahman', avatarUrl: null, city: 'Sylhet' } },
  { id: SERVICE_IDS.plumbing, providerId: USER_IDS.jamal, name: 'Plumbing Services', nameBn: 'প্লাম্বিং সার্ভিস', description: 'Expert plumbing solutions - pipe fitting, leak repair, drain cleaning.', category: 'domestic', subcategory: 'plumbing', priceType: 'quote', basePrice: 40000, imageUrl: '', rating: 4.5, reviewCount: 28, isAvailable: true, serviceType: 'at_customer', createdAt: '2025-01-17T10:00:00.000Z', updatedAt: '2025-01-17T10:00:00.000Z', provider: { id: USER_IDS.jamal, name: 'Jamal Ahmed', avatarUrl: null, city: 'Dhaka' } },
  { id: SERVICE_IDS.ac, providerId: USER_IDS.jamal, name: 'AC Servicing & Repair', nameBn: 'এসি সার্ভিসিং ও মেরামত', description: 'Professional AC cleaning, gas refill, and repair service for all brands.', category: 'domestic', subcategory: 'ac_service', priceType: 'fixed', basePrice: 35000, imageUrl: '', rating: 4.8, reviewCount: 56, isAvailable: true, serviceType: 'at_customer', createdAt: '2025-01-16T10:00:00.000Z', updatedAt: '2025-01-16T10:00:00.000Z', provider: { id: USER_IDS.jamal, name: 'Jamal Ahmed', avatarUrl: null, city: 'Dhaka' } },
  { id: SERVICE_IDS.electrical, providerId: USER_IDS.jamal, name: 'Home Electrical Repair', nameBn: 'বাসায় ইলেকট্রিক্যাল মেরামত', description: 'Complete home electrical repair and installation services. Licensed electrician with 8+ years experience.', category: 'domestic', subcategory: 'electrical', priceType: 'quote', basePrice: 50000, imageUrl: '', rating: 4.7, reviewCount: 34, isAvailable: true, serviceType: 'at_customer', createdAt: '2025-01-15T10:00:00.000Z', updatedAt: '2025-01-15T10:00:00.000Z', provider: { id: USER_IDS.jamal, name: 'Jamal Ahmed', avatarUrl: null, city: 'Dhaka' } },
];

// ============ DOCTORS ============

export const demoDoctors = [
  { id: DOCTOR_IDS.amina, name: 'Dr. Amina Rahman', specialty: 'Cardiology', qualification: 'MBBS, MD (Cardiology), FACC', hospital: 'National Heart Foundation Hospital', city: 'Dhaka', rating: 4.9, fee: 200000, imageUrl: '', availableSlots: 5, createdAt: '2025-01-15T10:00:00.000Z' },
  { id: DOCTOR_IDS.shirin, name: 'Dr. Shirin Akhter', specialty: 'Gynecology', qualification: 'MBBS, FCPS (OBGYN)', hospital: 'Square Hospital', city: 'Dhaka', rating: 4.8, fee: 180000, imageUrl: '', availableSlots: 4, createdAt: '2025-01-15T10:00:00.000Z' },
  { id: DOCTOR_IDS.nasima, name: 'Dr. Nasima Begum', specialty: 'Pediatrics', qualification: 'MBBS, DCH, MD (Pediatrics)', hospital: 'Chittagong Medical College Hospital', city: 'Chittagong', rating: 4.8, fee: 100000, imageUrl: '', availableSlots: 8, createdAt: '2025-01-15T10:00:00.000Z' },
  { id: DOCTOR_IDS.kamal, name: 'Dr. Kamal Hossain', specialty: 'Orthopedics', qualification: 'MBBS, MS (Ortho)', hospital: 'Bangabandhu Sheikh Mujib Medical University', city: 'Dhaka', rating: 4.7, fee: 150000, imageUrl: '', availableSlots: 3, createdAt: '2025-01-15T10:00:00.000Z' },
  { id: DOCTOR_IDS.tanvir, name: 'Dr. Tanvir Ahmed', specialty: 'Dermatology', qualification: 'MBBS, DD (Dermatology)', hospital: 'Labaid Hospital', city: 'Chittagong', rating: 4.6, fee: 120000, imageUrl: '', availableSlots: 6, createdAt: '2025-01-15T10:00:00.000Z' },
  { id: DOCTOR_IDS.rafiqul, name: 'Dr. Rafiqul Islam', specialty: 'General Medicine', qualification: 'MBBS, FCPS (Medicine)', hospital: 'United Hospital', city: 'Dhaka', rating: 4.5, fee: 80000, imageUrl: '', availableSlots: 10, createdAt: '2025-01-15T10:00:00.000Z' },
];

// ============ APPOINTMENTS ============

export const demoAppointments = [
  { id: 'demo_appt_002', userId: USER_IDS.rahim, doctorId: DOCTOR_IDS.shirin, date: '2025-02-05', time: '14:00', status: 'scheduled', notes: 'Regular checkup', createdAt: '2025-01-20T10:00:00.000Z', doctor: { id: DOCTOR_IDS.shirin, name: 'Dr. Shirin Akhter', specialty: 'Gynecology', qualification: 'MBBS, FCPS (OBGYN)', hospital: 'Square Hospital', city: 'Dhaka', rating: 4.8, fee: 180000, imageUrl: '', availableSlots: 4, createdAt: '2025-01-15T10:00:00.000Z' } },
  { id: 'demo_appt_001', userId: USER_IDS.rahim, doctorId: DOCTOR_IDS.amina, date: '2025-01-25', time: '10:30', status: 'scheduled', notes: 'Follow-up for cardiac checkup', createdAt: '2025-01-18T10:00:00.000Z', doctor: { id: DOCTOR_IDS.amina, name: 'Dr. Amina Rahman', specialty: 'Cardiology', qualification: 'MBBS, MD (Cardiology), FACC', hospital: 'National Heart Foundation Hospital', city: 'Dhaka', rating: 4.9, fee: 200000, imageUrl: '', availableSlots: 5, createdAt: '2025-01-15T10:00:00.000Z' } },
];

// ============ MEDICAL REPORTS ============

export const demoMedicalReports = [
  { id: 'demo_report_004', userId: USER_IDS.rahim, title: 'Lipid Profile', reportType: 'blood_test', labName: 'Labaid Diagnostics', reportDate: '2024-12-20', findings: 'Total Cholesterol: 195 mg/dL, HDL: 55 mg/dL, LDL: 120 mg/dL, Triglycerides: 140 mg/dL', doctorName: 'Dr. Amina Rahman', imageUrl: '', isShared: true, sharedWithId: DOCTOR_IDS.amina, sharedUntil: '2025-02-20', createdAt: '2024-12-20T10:00:00.000Z' },
  { id: 'demo_report_001', userId: USER_IDS.rahim, title: 'Complete Blood Count (CBC)', reportType: 'blood_test', labName: 'Labaid Diagnostics', reportDate: '2025-01-10', findings: 'All parameters within normal range. Hb: 14.2 g/dL, WBC: 7500/cmm, Platelet: 2.5 Lakh/cmm', doctorName: 'Dr. Rafiqul Islam', imageUrl: '', isShared: false, sharedWithId: null, sharedUntil: null, createdAt: '2025-01-10T10:00:00.000Z' },
  { id: 'demo_report_002', userId: USER_IDS.rahim, title: 'Chest X-Ray (PA View)', reportType: 'xray', labName: 'Popular Diagnostics', reportDate: '2025-01-05', findings: 'Normal chest X-ray. Heart size normal. No active lung lesion.', doctorName: 'Dr. Amina Rahman', imageUrl: '', isShared: false, sharedWithId: null, sharedUntil: null, createdAt: '2025-01-05T10:00:00.000Z' },
];

// ============ DISCOVER (Business Locations) ============

export const demoDiscover = [
  { id: 'demo_loc_001', ownerId: USER_IDS.rahim, businessName: 'Rahim Super Store', category: 'grocery', subcategories: '["rice","dairy","pulses","spices"]', address: '27 Dhanmondi 7/A', area: 'Dhanmondi', city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', latitude: 23.7461, longitude: 90.3746, rating: 4.6, isOpen: true, phone: '+8801712345678', createdAt: '2025-01-15T10:00:00.000Z', owner: { id: USER_IDS.rahim, name: 'Rahim Uddin', avatarUrl: null }, distance: 1.2, distanceText: '1.2 km' },
  { id: 'demo_loc_006', ownerId: USER_IDS.abdul, businessName: 'Abdul Photography Studio', category: 'business', subcategories: '["photography","videography"]', address: '18 Amberkhana', area: 'Amberkhana', city: 'Sylhet', district: 'Sylhet', division: 'Sylhet', latitude: 24.8899, longitude: 91.8737, rating: 4.9, isOpen: true, phone: '+8801312345680', createdAt: '2025-01-15T10:00:00.000Z', owner: { id: USER_IDS.abdul, name: 'Abdul Rahman', avatarUrl: null }, distance: 2.1, distanceText: '2.1 km' },
  { id: 'demo_loc_002', ownerId: USER_IDS.nasreen, businessName: 'Nasreen Fashion House', category: 'fashion', subcategories: '["saree","panjabi","three_piece"]', address: '15 New Market, Farmgate', area: 'Farmgate', city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', latitude: 23.7561, longitude: 90.3846, rating: 4.8, isOpen: true, phone: '+8801612345678', createdAt: '2025-01-15T10:00:00.000Z', owner: { id: USER_IDS.nasreen, name: 'Nasreen Akter', avatarUrl: null }, distance: 1.8, distanceText: '1.8 km' },
  { id: 'demo_loc_003', ownerId: USER_IDS.nasreen, businessName: 'Nasreen Organic Shop', category: 'organic', subcategories: '["honey","oil","spices"]', address: '8 Banani 11', area: 'Banani', city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', latitude: 23.7937, longitude: 90.4143, rating: 4.7, isOpen: false, phone: '+8801612345680', createdAt: '2025-01-15T10:00:00.000Z', owner: { id: USER_IDS.nasreen, name: 'Nasreen Akter', avatarUrl: null }, distance: 3.4, distanceText: '3.4 km' },
  { id: 'demo_loc_004', ownerId: USER_IDS.jamal, businessName: 'Jamal Electrical Services', category: 'domestic', subcategories: '["electrical","ac_service","plumbing"]', address: '42 Mirpur 10', area: 'Mirpur', city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', latitude: 23.8070, longitude: 90.3675, rating: 4.7, isOpen: true, phone: '+8801512345678', createdAt: '2025-01-15T10:00:00.000Z', owner: { id: USER_IDS.jamal, name: 'Jamal Ahmed', avatarUrl: null }, distance: 2.7, distanceText: '2.7 km' },
  { id: 'demo_loc_005', ownerId: USER_IDS.abdul, businessName: 'Sylhet Auto Care', category: 'business', subcategories: '["auto_repair","diagnostics"]', address: '5 Zindabazar', area: 'Zindabazar', city: 'Sylhet', district: 'Sylhet', division: 'Sylhet', latitude: 24.8949, longitude: 91.8687, rating: 4.5, isOpen: true, phone: '+8801312345678', createdAt: '2025-01-15T10:00:00.000Z', owner: { id: USER_IDS.abdul, name: 'Abdul Rahman', avatarUrl: null }, distance: 4.3, distanceText: '4.3 km' },
];

// ============ MERCHANT ANALYTICS ============

export const demoMerchantAnalytics = {
  revenue: {
    thisMonth: 37500,
    lastMonth: 22000,
    growth: 70.5,
  },
  orders: {
    total: 3,
    pending: 1,
    completed: 2,
  },
  topProducts: [
    { name: 'Premium Basmati Rice', sold: 2, revenue: 24000 },
    { name: 'Organic Dal (Masoor)', sold: 1, revenue: 15000 },
    { name: 'Fresh Milk (Dairy Pure)', sold: 0, revenue: 0 },
  ],
  recentOrders: [
    {
      id: 'demo_order_001',
      buyerId: USER_IDS.fatema,
      sellerId: USER_IDS.rahim,
      totalAmount: 28500,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'wallet',
      deliveryType: 'home_delivery',
      deliveryAddress: '12/A GEC Circle, Chittagong',
      createdAt: '2025-01-15T14:00:00.000Z',
      updatedAt: '2025-01-18T10:00:00.000Z',
      items: [
        {
          id: 'demo_oi_001',
          orderId: 'demo_order_001',
          productId: PRODUCT_IDS.basmatiRice,
          quantity: 2,
          price: 12000,
          product: {
            id: PRODUCT_IDS.basmatiRice,
            name: 'Premium Basmati Rice',
            nameBn: 'প্রিমিয়াম বাসমতি চাল',
            description: 'Aged premium basmati rice from Dinajpur.',
            price: 12000,
            category: 'grocery',
            subcategory: 'rice',
            imageUrl: '',
            stock: 150,
            unit: 'kg',
            rating: 4.5,
            reviewCount: 23,
            isActive: true,
            sellerId: USER_IDS.rahim,
            createdAt: '2025-01-13T10:00:00.000Z',
            updatedAt: '2025-01-13T10:00:00.000Z',
          },
        },
        {
          id: 'demo_oi_002',
          orderId: 'demo_order_001',
          productId: PRODUCT_IDS.dal,
          quantity: 1,
          price: 15000,
          product: {
            id: PRODUCT_IDS.dal,
            name: 'Organic Dal (Masoor)',
            nameBn: 'জৈব মসুর ডাল',
            description: 'Organic red lentils from Rajshahi.',
            price: 15000,
            category: 'grocery',
            subcategory: 'pulses',
            imageUrl: '',
            stock: 80,
            unit: 'kg',
            rating: 4.3,
            reviewCount: 18,
            isActive: true,
            sellerId: USER_IDS.rahim,
            createdAt: '2025-01-15T10:00:00.000Z',
            updatedAt: '2025-01-15T10:00:00.000Z',
          },
        },
      ],
      buyer: { id: USER_IDS.fatema, name: 'Fatema Begum', avatarUrl: null },
    },
  ],
};

// ============ SERVICE REQUESTS ============

export const demoServiceRequests = [
  {
    id: 'demo_sr_003', customerId: USER_IDS.rahim, providerId: USER_IDS.abdul, serviceId: SERVICE_IDS.photography,
    status: 'pending', scheduledDate: '2025-02-01', scheduledTime: '09:00',
    address: 'Gulshan Park, Dhaka', notes: 'Birthday party photography', quotedPrice: null, finalPrice: null,
    createdAt: '2025-01-20T15:00:00.000Z', updatedAt: '2025-01-20T15:00:00.000Z',
    service: { id: SERVICE_IDS.photography, name: 'Professional Photography', category: 'business', imageUrl: '' },
  },
  {
    id: 'demo_sr_002', customerId: USER_IDS.fatema, providerId: USER_IDS.jamal, serviceId: SERVICE_IDS.ac,
    status: 'accepted', scheduledDate: '2025-01-22', scheduledTime: '14:00',
    address: '12/A GEC Circle, Chittagong', notes: '2 ACs need servicing', quotedPrice: null, finalPrice: null,
    createdAt: '2025-01-19T10:00:00.000Z', updatedAt: '2025-01-19T12:00:00.000Z',
    service: { id: SERVICE_IDS.ac, name: 'AC Servicing & Repair', category: 'domestic', imageUrl: '' },
  },
  {
    id: 'demo_sr_001', customerId: USER_IDS.rahim, providerId: USER_IDS.jamal, serviceId: SERVICE_IDS.electrical,
    status: 'completed', scheduledDate: '2025-01-15', scheduledTime: '10:00',
    address: '45 Dhanmondi 27, Dhaka', notes: 'Fan switch needs replacement', quotedPrice: null, finalPrice: 25000,
    createdAt: '2025-01-14T08:00:00.000Z', updatedAt: '2025-01-15T11:00:00.000Z',
    service: { id: SERVICE_IDS.electrical, name: 'Home Electrical Repair', category: 'domestic', imageUrl: '' },
  },
];

// ============ AGGREGATE EXPORT ============

export const demoData = {
  platformStats: demoPlatformStats,
  userMe: demoUserMe,
  products: demoProducts,
  orders: demoOrders,
  wallet: demoWallet,
  farmProducts: demoFarmProducts,
  marketPrices: demoMarketPrices,
  services: demoServices,
  doctors: demoDoctors,
  appointments: demoAppointments,
  medicalReports: demoMedicalReports,
  discover: demoDiscover,
  merchantAnalytics: demoMerchantAnalytics,
  serviceRequests: demoServiceRequests,
};