import { db } from '@/lib/db';

async function seed() {
  console.log('Seeding Nityodin Platform...');

  // ============ USERS with Multiple Roles ============
  const users = await Promise.all([
    db.user.create({
      data: {
        phone: '+8801712345678', name: 'Rahim Uddin', email: 'rahim@example.com',
        city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', gender: 'male',
        isPhoneVerified: true, isNidVerified: true,
        roles: { create: [
          { role: 'consumer', isActive: true },
          { role: 'merchant', isActive: true },
        ]},
      },
    }),
    db.user.create({
      data: {
        phone: '+8801812345678', name: 'Fatema Begum', email: 'fatema@example.com',
        city: 'Chittagong', district: 'Chittagong', division: 'Chittagong', gender: 'female',
        isPhoneVerified: true,
        roles: { create: [{ role: 'consumer', isActive: true }] },
      },
    }),
    db.user.create({
      data: {
        phone: '+8801912345678', name: 'Karim Hossain', email: 'karim@example.com',
        city: 'Rajshahi', district: 'Rajshahi', division: 'Rajshahi', gender: 'male',
        isPhoneVerified: true, isNidVerified: true,
        roles: { create: [{ role: 'farmer', isActive: true }] },
      },
    }),
    db.user.create({
      data: {
        phone: '+8801512345678', name: 'Jamal Ahmed', email: 'jamal@example.com',
        city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', gender: 'male',
        isPhoneVerified: true,
        roles: { create: [{ role: 'service_provider', isActive: true }] },
      },
    }),
    db.user.create({
      data: {
        phone: '+8801612345678', name: 'Nasreen Akter', email: 'nasreen@example.com',
        city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', gender: 'female',
        isPhoneVerified: true, isNidVerified: true,
        roles: { create: [{ role: 'merchant', isActive: true }] },
      },
    }),
    db.user.create({
      data: {
        phone: '+8801312345678', name: 'Abdul Rahman', email: 'abdul@example.com',
        city: 'Sylhet', district: 'Sylhet', division: 'Sylhet', gender: 'male',
        isPhoneVerified: true,
        roles: { create: [{ role: 'service_provider', isActive: true }] },
      },
    }),
  ]);

  // ============ WALLETS & TRANSACTIONS ============
  const wallets = await Promise.all([
    db.wallet.create({ data: { userId: users[0].id, balance: 4560000 } }), // 45,600 BDT
    db.wallet.create({ data: { userId: users[1].id, balance: 2340000 } }), // 23,400 BDT
    db.wallet.create({ data: { userId: users[2].id, balance: 1250000 } }), // 12,500 BDT
    db.wallet.create({ data: { userId: users[3].id, balance: 890000 } }),  // 8,900 BDT
    db.wallet.create({ data: { userId: users[4].id, balance: 6780000 } }), // 67,800 BDT
    db.wallet.create({ data: { userId: users[5].id, balance: 345000 } }),  // 3,450 BDT
  ]);

  // Create transactions for wallets
  const txData = [
    { walletId: wallets[0].id, type: 'credit', amount: 500000, description: 'Funded via bKash', paymentMethod: 'bKash', referenceType: 'funding', status: 'completed' },
    { walletId: wallets[0].id, type: 'debit', amount: 45000, description: 'Order #ORD001', paymentMethod: 'wallet', referenceType: 'order', referenceId: 'ORD001', status: 'completed' },
    { walletId: wallets[0].id, type: 'credit', amount: 12500, description: 'Refund - cancelled order', paymentMethod: 'wallet', referenceType: 'order', status: 'completed' },
    { walletId: wallets[0].id, type: 'transfer', amount: 50000, description: 'P2P Transfer to Fatema', paymentMethod: 'wallet', referenceType: 'p2p', status: 'completed' },
    { walletId: wallets[0].id, type: 'debit', amount: 85000, description: 'Service: Electrical Repair', paymentMethod: 'wallet', referenceType: 'service', status: 'completed' },
    { walletId: wallets[0].id, type: 'credit', amount: 200000, description: 'Funded via Nagad', paymentMethod: 'Nagad', referenceType: 'funding', status: 'completed' },
    { walletId: wallets[0].id, type: 'escrow_hold', amount: 30000, description: 'Service Payment Hold', paymentMethod: 'wallet', referenceType: 'service', status: 'completed' },
    { walletId: wallets[1].id, type: 'credit', amount: 300000, description: 'Funded via Rocket', paymentMethod: 'Rocket', referenceType: 'funding', status: 'completed' },
    { walletId: wallets[1].id, type: 'debit', amount: 66000, description: 'Order #ORD003', paymentMethod: 'wallet', referenceType: 'order', status: 'completed' },
    { walletId: wallets[4].id, type: 'credit', amount: 1200000, description: 'Sales Revenue', paymentMethod: 'wallet', referenceType: 'order', status: 'completed' },
    { walletId: wallets[4].id, type: 'debit', amount: 50000, description: 'P2P Transfer', paymentMethod: 'wallet', referenceType: 'p2p', status: 'completed' },
  ];
  await Promise.all(txData.map(t => db.transaction.create({ data: t })));

  // ============ PRODUCTS (Retail) ============
  const products = await Promise.all([
    db.product.create({ data: { sellerId: users[0].id, name: 'Premium Basmati Rice', nameBn: 'প্রিমিয়াম বাসমতি চাল', description: 'Aged premium basmati rice from Dinajpur. Perfect for biryani and pulao.', price: 12000, category: 'grocery', subcategory: 'rice', stock: 150, unit: 'kg', rating: 4.5, reviewCount: 23, imageUrl: '' } }),
    db.product.create({ data: { sellerId: users[0].id, name: 'Fresh Milk (Dairy Pure)', nameBn: 'তাজা দুধ', description: 'Farm-fresh pasteurized cow milk. No preservatives added.', price: 8500, category: 'grocery', subcategory: 'dairy', stock: 200, unit: 'liter', rating: 4.8, reviewCount: 56, imageUrl: '' } }),
    db.product.create({ data: { sellerId: users[0].id, name: 'Organic Dal (Masoor)', nameBn: 'জৈব মসুর ডাল', description: 'Organic red lentils sourced from Rajshahi farmers. High protein content.', price: 15000, category: 'grocery', subcategory: 'pulses', stock: 80, unit: 'kg', rating: 4.3, reviewCount: 18, imageUrl: '' } }),
    db.product.create({ data: { sellerId: users[4].id, name: 'Luxury Saree Collection', nameBn: 'লাক্সারি শাড়ি কালেকশন', description: 'Handcrafted Jamdani saree from Narayanganj. Traditional Bengali heritage.', price: 850000, category: 'fashion', subcategory: 'saree', stock: 12, unit: 'piece', rating: 4.9, reviewCount: 87, imageUrl: '' } }),
    db.product.create({ data: { sellerId: users[4].id, name: 'Pure Cotton Panjabi', nameBn: 'খাঁটি সুতি পাঞ্জাবি', description: 'Premium cotton panjabi for men. Comfortable for daily wear and occasions.', price: 350000, category: 'fashion', subcategory: 'men', stock: 25, unit: 'piece', rating: 4.6, reviewCount: 42, imageUrl: '' } }),
    db.product.create({ data: { sellerId: users[4].id, name: 'Organic Virgin Coconut Oil', nameBn: 'অর্গানিক ভার্জিন নারিকেল তেল', description: 'Cold-pressed virgin coconut oil from Barisal. Multi-purpose use.', price: 9500, category: 'grocery', subcategory: 'oil', stock: 300, unit: 'liter', rating: 4.7, reviewCount: 65, imageUrl: '' } }),
    db.product.create({ data: { sellerId: users[4].id, name: 'Fresh Hilsha Fish', nameBn: 'তাজা ইলিশ মাছ', description: 'Fresh Padma river Hilsha. Perfect for special occasions.', price: 120000, category: 'grocery', subcategory: 'fish', stock: 30, unit: 'kg', rating: 4.4, reviewCount: 34, imageUrl: '' } }),
    db.product.create({ data: { sellerId: users[4].id, name: 'Organic Honey (Sundarbans)', nameBn: 'সুন্দরবনের মধু', description: 'Pure organic honey collected from Sundarbans mangrove forest.', price: 180000, category: 'grocery', subcategory: 'honey', stock: 50, unit: 'kg', rating: 4.9, reviewCount: 91, imageUrl: '' } }),
  ]);

  // ============ ORDERS ============
  await Promise.all([
    db.order.create({
      data: {
        buyerId: users[1].id, sellerId: users[0].id, totalAmount: 28500,
        status: 'delivered', paymentStatus: 'paid', paymentMethod: 'wallet', deliveryType: 'home_delivery',
        deliveryAddress: '12/A GEC Circle, Chittagong',
        items: { create: [
          { productId: products[0].id, quantity: 2, price: 12000 },
          { productId: products[2].id, quantity: 1, price: 15000 },
        ]},
      },
    }),
    db.order.create({
      data: {
        buyerId: users[1].id, sellerId: users[4].id, totalAmount: 850000,
        status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'Nagad', deliveryType: 'pickup',
        items: { create: [{ productId: products[3].id, quantity: 1, price: 850000 }] },
      },
    }),
    db.order.create({
      data: {
        buyerId: users[0].id, sellerId: users[4].id, totalAmount: 129500,
        status: 'preparing', paymentStatus: 'paid', paymentMethod: 'wallet', deliveryType: 'home_delivery',
        deliveryAddress: '45 Dhanmondi 27, Dhaka',
        items: { create: [
          { productId: products[6].id, quantity: 1, price: 120000 },
          { productId: products[5].id, quantity: 1, price: 9500 },
        ]},
      },
    }),
  ]);

  // ============ REVIEWS ============
  await Promise.all([
    db.review.create({ data: { userId: users[1].id, productId: products[0].id, rating: 5, comment: 'Excellent quality basmati rice! Very aromatic and perfectly aged.' } }),
    db.review.create({ data: { userId: users[1].id, productId: products[2].id, rating: 4, comment: 'Good organic dal. Cooks well and tastes fresh.' } }),
    db.review.create({ data: { userId: users[0].id, productId: products[3].id, rating: 5, comment: 'Stunning Jamdani saree! The craftsmanship is incredible.' } }),
  ]);

  // ============ FARM PRODUCTS (Agriculture) ============
  await Promise.all([
    db.farmProduct.create({ data: { farmerId: users[2].id, name: 'Premium Aman Rice', nameBn: 'প্রিমিয়াম আমন ধান', description: 'Freshly harvested Aman rice from Rajshahi. High quality, organic.', price: 5500, unit: 'kg', category: 'rice', quantity: 500, origin: 'Rajshahi', isOrganic: true, harvestDate: '2024-12-15' } }),
    db.farmProduct.create({ data: { farmerId: users[2].id, name: 'Organic Potatoes', nameBn: 'জৈব আলু', description: 'Fresh organic potatoes from Rangpur. Great for curries.', price: 3000, unit: 'kg', category: 'vegetables', quantity: 1200, origin: 'Rangpur', isOrganic: true, harvestDate: '2025-01-10' } }),
    db.farmProduct.create({ data: { farmerId: users[2].id, name: 'Fresh Mangoes (Langra)', nameBn: 'তাজা ল্যাংড়া আম', description: 'Premium Langra mangoes from Chapainawabganj. Sweet and juicy.', price: 8000, unit: 'kg', category: 'fruits', quantity: 200, origin: 'Chapainawabganj', isOrganic: false, harvestDate: '2025-05-20' } }),
    db.farmProduct.create({ data: { farmerId: users[2].id, name: 'Red Spinach (Lal Shak)', nameBn: 'লাল শাক', description: 'Fresh organic red spinach. Rich in iron and vitamins.', price: 2000, unit: 'kg', category: 'vegetables', quantity: 100, origin: 'Rajshahi', isOrganic: true, harvestDate: '2025-01-18' } }),
    db.farmProduct.create({ data: { farmerId: users[2].id, name: 'Mustard Oil (Cold Pressed)', nameBn: 'সরিষার তেল (ঘানিভাঙ্গা)', description: 'Traditional cold-pressed mustard oil. Pure and natural.', price: 18000, unit: 'liter', category: 'oil_seeds', quantity: 300, origin: 'Rajshahi', isOrganic: true, harvestDate: '2025-01-05' } }),
  ]);

  // ============ MARKET PRICES ============
  const commodities = [
    { commodity: 'Rice (Miniket)', price: 6500, change: -2.1, market: 'Kawran Bazar' },
    { commodity: 'Rice (Aman)', price: 5500, change: 1.5, market: 'Kawran Bazar' },
    { commodity: 'Wheat Flour', price: 5800, change: 0.8, market: 'Kawran Bazar' },
    { commodity: 'Potato', price: 3000, change: -5.3, market: 'Kawran Bazar' },
    { commodity: 'Onion', price: 4500, change: 3.2, market: 'Kawran Bazar' },
    { commodity: 'Tomato', price: 4000, change: -1.8, market: 'Kawran Bazar' },
    { commodity: 'Green Chili', price: 8000, change: 6.5, market: 'Kawran Bazar' },
    { commodity: 'Mustard Oil', price: 18000, change: 0.5, market: 'Kawran Bazar' },
    { commodity: 'Soybean Oil', price: 15500, change: -0.3, market: 'Kawran Bazar' },
    { commodity: 'Sugar', price: 12000, change: 1.0, market: 'Kawran Bazar' },
    { commodity: 'Eggs (per dozen)', price: 15000, change: 2.4, market: 'Kawran Bazar' },
    { commodity: 'Milk (per liter)', price: 8500, change: 0.0, market: 'Kawran Bazar' },
  ];
  await Promise.all(commodities.map(c =>
    db.marketPrice.create({ data: { ...c, date: '2025-01-20', unit: c.commodity.includes('dozen') ? 'dozen' : c.commodity.includes('liter') ? 'liter' : 'kg' } })
  ));

  // ============ SERVICES (Business & Domestic) ============
  const services = await Promise.all([
    db.service.create({ data: { providerId: users[3].id, name: 'Home Electrical Repair', nameBn: 'বাসায় ইলেকট্রিক্যাল মেরামত', description: 'Complete home electrical repair and installation services. Licensed electrician with 8+ years experience.', category: 'domestic', subcategory: 'electrical', priceType: 'quote', basePrice: 50000, rating: 4.7, reviewCount: 34, isAvailable: true, serviceType: 'at_customer' } }),
    db.service.create({ data: { providerId: users[3].id, name: 'AC Servicing & Repair', nameBn: 'এসি সার্ভিসিং ও মেরামত', description: 'Professional AC cleaning, gas refill, and repair service for all brands.', category: 'domestic', subcategory: 'ac_service', priceType: 'fixed', basePrice: 35000, rating: 4.8, reviewCount: 56, isAvailable: true, serviceType: 'at_customer' } }),
    db.service.create({ data: { providerId: users[3].id, name: 'Plumbing Services', nameBn: 'প্লাম্বিং সার্ভিস', description: 'Expert plumbing solutions - pipe fitting, leak repair, drain cleaning.', category: 'domestic', subcategory: 'plumbing', priceType: 'quote', basePrice: 40000, rating: 4.5, reviewCount: 28, isAvailable: true, serviceType: 'at_customer' } }),
    db.service.create({ data: { providerId: users[5].id, name: 'Professional Photography', nameBn: 'প্রফেশনাল ফটোগ্রাফি', description: 'Wedding, event, and portrait photography. Includes editing and delivery.', category: 'business', subcategory: 'photography', priceType: 'fixed', basePrice: 150000, rating: 4.9, reviewCount: 45, isAvailable: true, serviceType: 'both' } }),
    db.service.create({ data: { providerId: users[5].id, name: 'Auto Repair & Diagnostics', nameBn: 'অটো মেরামত ও ডায়াগনস্টিক্স', description: 'Complete car and motorcycle repair. Computerized diagnostics available.', category: 'business', subcategory: 'auto_repair', priceType: 'quote', basePrice: 30000, rating: 4.6, reviewCount: 38, isAvailable: true, serviceType: 'in_venue' } }),
    db.service.create({ data: { providerId: users[5].id, name: 'Home Beauty Service', nameBn: 'হোম বিউটি সার্ভিস', description: 'Professional beauty services at your doorstep. Bridal, party makeup, and hair styling.', category: 'business', subcategory: 'beauty', priceType: 'fixed', basePrice: 25000, rating: 4.4, reviewCount: 22, isAvailable: true, serviceType: 'at_customer' } }),
  ]);

  // ============ SERVICE REQUESTS ============
  await Promise.all([
    db.serviceRequest.create({ data: { customerId: users[0].id, providerId: users[3].id, serviceId: services[0].id, status: 'completed', scheduledDate: '2025-01-15', scheduledTime: '10:00', address: '45 Dhanmondi 27, Dhaka', notes: 'Fan switch needs replacement', finalPrice: 25000 } }),
    db.serviceRequest.create({ data: { customerId: users[1].id, providerId: users[3].id, serviceId: services[1].id, status: 'accepted', scheduledDate: '2025-01-22', scheduledTime: '14:00', address: '12/A GEC Circle, Chittagong', notes: '2 ACs need servicing' } }),
    db.serviceRequest.create({ data: { customerId: users[0].id, providerId: users[5].id, serviceId: services[3].id, status: 'pending', scheduledDate: '2025-02-01', scheduledTime: '09:00', address: 'Gulshan Park, Dhaka', notes: 'Birthday party photography' } }),
  ]);

  // ============ MEDICAL - DOCTORS ============
  const doctors = await Promise.all([
    db.doctor.create({ data: { name: 'Dr. Amina Rahman', specialty: 'Cardiology', qualification: 'MBBS, MD (Cardiology), FACC', hospital: 'National Heart Foundation Hospital', city: 'Dhaka', rating: 4.9, fee: 200000, availableSlots: 5 } }),
    db.doctor.create({ data: { name: 'Dr. Kamal Hossain', specialty: 'Orthopedics', qualification: 'MBBS, MS (Ortho)', hospital: 'Bangabandhu Sheikh Mujib Medical University', city: 'Dhaka', rating: 4.7, fee: 150000, availableSlots: 3 } }),
    db.doctor.create({ data: { name: 'Dr. Shirin Akhter', specialty: 'Gynecology', qualification: 'MBBS, FCPS (OBGYN)', hospital: 'Square Hospital', city: 'Dhaka', rating: 4.8, fee: 180000, availableSlots: 4 } }),
    db.doctor.create({ data: { name: 'Dr. Tanvir Ahmed', specialty: 'Dermatology', qualification: 'MBBS, DD (Dermatology)', hospital: 'Labaid Hospital', city: 'Chittagong', rating: 4.6, fee: 120000, availableSlots: 6 } }),
    db.doctor.create({ data: { name: 'Dr. Nasima Begum', specialty: 'Pediatrics', qualification: 'MBBS, DCH, MD (Pediatrics)', hospital: 'Chittagong Medical College Hospital', city: 'Chittagong', rating: 4.8, fee: 100000, availableSlots: 8 } }),
    db.doctor.create({ data: { name: 'Dr. Rafiqul Islam', specialty: 'General Medicine', qualification: 'MBBS, FCPS (Medicine)', hospital: 'United Hospital', city: 'Dhaka', rating: 4.5, fee: 80000, availableSlots: 10 } }),
  ]);

  // ============ MEDICAL REPORTS ============
  await Promise.all([
    db.medicalReport.create({ data: { userId: users[0].id, title: 'Complete Blood Count (CBC)', reportType: 'blood_test', labName: 'Labaid Diagnostics', reportDate: '2025-01-10', findings: 'All parameters within normal range. Hb: 14.2 g/dL, WBC: 7500/cmm, Platelet: 2.5 Lakh/cmm', doctorName: 'Dr. Rafiqul Islam' } }),
    db.medicalReport.create({ data: { userId: users[0].id, title: 'Chest X-Ray (PA View)', reportType: 'xray', labName: 'Popular Diagnostics', reportDate: '2025-01-05', findings: 'Normal chest X-ray. Heart size normal. No active lung lesion.', doctorName: 'Dr. Amina Rahman' } }),
    db.medicalReport.create({ data: { userId: users[1].id, title: 'Blood Sugar (Fasting)', reportType: 'blood_test', labName: ' Ibn Sina Diagnostics', reportDate: '2025-01-12', findings: 'Fasting Blood Sugar: 95 mg/dL (Normal: 70-100 mg/dL). Within normal limits.', doctorName: 'Dr. Shirin Akhter' } }),
    db.medicalReport.create({ data: { userId: users[0].id, title: 'Lipid Profile', reportType: 'blood_test', labName: 'Labaid Diagnostics', reportDate: '2024-12-20', findings: 'Total Cholesterol: 195 mg/dL, HDL: 55 mg/dL, LDL: 120 mg/dL, Triglycerides: 140 mg/dL', doctorName: 'Dr. Amina Rahman', isShared: true, sharedWithId: doctors[0].id, sharedUntil: '2025-02-20' } }),
    db.medicalReport.create({ data: { userId: users[1].id, title: 'Ultrasound - Abdomen', reportType: 'ultrasound', labName: 'United Hospital Diagnostics', reportDate: '2025-01-15', findings: 'Liver normal in size and echotexture. Gallbladder normal. Kidneys normal bilaterally.', doctorName: 'Dr. Kamal Hossain' } }),
  ]);

  // ============ APPOINTMENTS ============
  await Promise.all([
    db.appointment.create({ data: { userId: users[0].id, doctorId: doctors[0].id, date: '2025-01-25', time: '10:30', status: 'scheduled', notes: 'Follow-up for cardiac checkup' } }),
    db.appointment.create({ data: { userId: users[0].id, doctorId: doctors[2].id, date: '2025-02-05', time: '14:00', status: 'scheduled', notes: 'Regular checkup' } }),
    db.appointment.create({ data: { userId: users[1].id, doctorId: doctors[3].id, date: '2025-01-28', time: '11:00', status: 'scheduled', notes: 'Skin rash treatment follow-up' } }),
  ]);

  // ============ BUSINESS LOCATIONS ============
  await Promise.all([
    db.businessLocation.create({ data: { ownerId: users[0].id, businessName: 'Rahim Super Store', category: 'grocery', subcategories: '["rice","dairy","pulses","spices"]', address: '27 Dhanmondi 7/A', area: 'Dhanmondi', city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', latitude: 23.7461, longitude: 90.3746, rating: 4.6, isOpen: true, phone: '+8801712345678' } }),
    db.businessLocation.create({ data: { ownerId: users[4].id, businessName: 'Nasreen Fashion House', category: 'fashion', subcategories: '["saree","panjabi","three_piece"]', address: '15 New Market, Farmgate', area: 'Farmgate', city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', latitude: 23.7561, longitude: 90.3846, rating: 4.8, isOpen: true, phone: '+8801612345678' } }),
    db.businessLocation.create({ data: { ownerId: users[4].id, businessName: 'Nasreen Organic Shop', category: 'organic', subcategories: '["honey","oil","spices"]', address: '8 Banani 11', area: 'Banani', city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', latitude: 23.7937, longitude: 90.4143, rating: 4.7, isOpen: false, phone: '+8801612345680' } }),
    db.businessLocation.create({ data: { ownerId: users[3].id, businessName: 'Jamal Electrical Services', category: 'domestic', subcategories: '["electrical","ac_service","plumbing"]', address: '42 Mirpur 10', area: 'Mirpur', city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', latitude: 23.8070, longitude: 90.3675, rating: 4.7, isOpen: true, phone: '+8801512345678' } }),
    db.businessLocation.create({ data: { ownerId: users[5].id, businessName: 'Sylhet Auto Care', category: 'business', subcategories: '["auto_repair","diagnostics"]', address: '5 Zindabazar', area: 'Zindabazar', city: 'Sylhet', district: 'Sylhet', division: 'Sylhet', latitude: 24.8949, longitude: 91.8687, rating: 4.5, isOpen: true, phone: '+8801312345678' } }),
    db.businessLocation.create({ data: { ownerId: users[5].id, businessName: 'Abdul Photography Studio', category: 'business', subcategories: '["photography","videography"]', address: '18 Amberkhana', area: 'Amberkhana', city: 'Sylhet', district: 'Sylhet', division: 'Sylhet', latitude: 24.8899, longitude: 91.8737, rating: 4.9, isOpen: true, phone: '+8801312345680' } }),
  ]);

  console.log('Nityodin Platform seeded successfully!');
  console.log(`- ${users.length} users with roles`);
  console.log(`- ${wallets.length} wallets with transactions`);
  console.log(`- ${products.length} retail products`);
  console.log(`- 3 orders with items`);
  console.log(`- 5 farm products + 12 market prices`);
  console.log(`- ${services.length} services + 3 requests`);
  console.log(`- ${doctors.length} doctors + 5 reports + 3 appointments`);
  console.log(`- 6 business locations`);
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });