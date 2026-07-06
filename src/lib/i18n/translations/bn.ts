// Bengali translations — natural Bangla, not transliterated English
const bn: Record<string, string> = {
  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------
  'nav.dashboard': 'ড্যাশবোর্ড',
  'nav.dashboardBn': 'ড্যাশবোর্ড',
  'nav.discover': 'অনুসন্ধান',
  'nav.wallet': 'ওয়ালেট',
  'nav.medical': 'চিকিৎসা',
  'nav.profile': 'প্রোফাইল',
  'nav.notifications': 'বিজ্ঞপ্তি',
  'nav.landing': 'হোম',
  'nav.login': 'লগইন',
  'nav.logout': 'লগআউট',
  'nav.cart': 'কার্ট',
  'nav.darkMode': 'ডার্ক মোড',
  'nav.lightMode': 'লাইট মোড',
  'nav.search': 'খুঁজুন',
  'nav.language': 'ভাষা',

  // -----------------------------------------------------------------------
  // Dashboard
  // -----------------------------------------------------------------------
  'dashboard.welcome': 'স্বাগতম',
  'dashboard.quickActions': 'দ্রুত কাজ',
  'dashboard.activeOrders': 'সক্রিয় অর্ডার',
  'dashboard.walletBalance': 'ওয়ালেট ব্যালেন্স',
  'dashboard.cartItems': 'কার্টের পণ্য',
  'dashboard.totalProducts': 'মোট পণ্য',
  'dashboard.revenue': 'আয়',
  'dashboard.rating': 'রেটিং',
  'dashboard.yourListings': 'আপনার তালিকা',
  'dashboard.avgMarketPrice': 'গড় বাজার মূল্য',
  'dashboard.earnings': 'আয়',
  'dashboard.organicItems': 'অর্গানিক পণ্য',
  'dashboard.recentRequests': 'সাম্প্রতিক অনুরোধ',
  'dashboard.yourServices': 'আপনার সেবাসমূহ',
  'dashboard.savedProducts': 'সংরক্ষিত পণ্য',
  'dashboard.consumer': 'ভোক্তা',
  'dashboard.merchant': 'ব্যবসায়ী',
  'dashboard.farmer': 'কৃষক',
  'dashboard.serviceProvider': 'সেবা প্রদানকারী',

  // -----------------------------------------------------------------------
  // Tabs
  // -----------------------------------------------------------------------
  'tab.overview': 'সারসংক্ষেপ',
  'tab.orders': 'অর্ডার',
  'tab.products': 'পণ্য',
  'tab.marketPrices': 'বাজার মূল্য',
  'tab.jobs': 'কাজ',
  'tab.myServices': 'আমার সেবা',
  'tab.services': 'সেবা',

  // -----------------------------------------------------------------------
  // Quick Actions
  // -----------------------------------------------------------------------
  'action.browseProducts': 'পণ্য দেখুন',
  'action.bookService': 'সেবা বুক করুন',
  'action.findDoctor': 'চিকিৎসক খুঁজুন',
  'action.addMoney': 'টাকা যোগ করুন',
  'action.addProduct': 'পণ্য যোগ করুন',
  'action.viewAnalytics': 'বিশ্লেষণ দেখুন',
  'action.manageOrders': 'অর্ডার পরিচালনা',
  'action.viewRequests': 'অনুরোধ দেখুন',
  'action.availability': 'প্রাপ্যতা',
  'action.wallet': 'ওয়ালেট',

  // -----------------------------------------------------------------------
  // Order
  // -----------------------------------------------------------------------
  'order.recentOrders': 'সাম্প্রতিক অর্ডার',
  'order.noOrders': 'এখনো কোনো অর্ডার নেই। শপিং শুরু করুন!',
  'order.items': 'পণ্য',
  'order.total': 'মোট',
  'order.cancel': 'বাতিল',
  'order.cancelConfirm': 'আপনি কি নিশ্চিত এই অর্ডারটি বাতিল করতে চান?',
  'order.cancelled': 'বাতিল',
  'order.status': 'অবস্থা',
  'order.placedOn': 'অর্ডারের তারিখ',
  'order.seller': 'বিক্রেতা',
  'order.itemsCount': '{count}টি পণ্য',
  'order.backToDashboard': 'ড্যাশবোর্ডে ফিরুন',
  'order.pending': 'অপেক্ষমান',
  'order.confirmed': 'নিশ্চিত',
  'order.preparing': 'প্রস্তুতি চলছে',
  'order.delivered': 'ডেলিভারি হয়েছে',
  'order.completed': 'সম্পন্ন',

  // -----------------------------------------------------------------------
  // Wallet
  // -----------------------------------------------------------------------
  'wallet.overview': 'সারসংক্ষেপ',
  'wallet.topUp': 'টপ আপ',
  'wallet.transfer': 'ট্রান্সফার',
  'wallet.transactions': 'লেনদেন',
  'wallet.escrow': 'এসক্রো',
  'wallet.balance': 'ব্যালেন্স',
  'wallet.addMoney': 'টাকা যোগ করুন',
  'wallet.sendMoney': 'টাকা পাঠান',
  'wallet.history': 'ইতিহাস',

  // -----------------------------------------------------------------------
  // Product
  // -----------------------------------------------------------------------
  'product.addToCart': 'কার্টে যোগ করুন',
  'product.added': 'যোগ হয়েছে',
  'product.outOfStock': 'স্টকে নেই',
  'product.inStock': 'স্টকে আছে',
  'product.rating': 'রেটিং',
  'product.reviews': 'রিভিউ',
  'product.noReviews': 'এখনো কোনো রিভিউ নেই',
  'product.writeReview': 'রিভিউ লিখুন',
  'product.submitReview': 'রিভিউ জমা দিন',
  'product.yourRating': 'আপনার রেটিং',
  'product.comment': 'মন্তব্য',
  'product.name': 'নাম',
  'product.price': 'মূল্য',
  'product.category': 'বিভাগ',
  'product.stock': 'স্টক',
  'product.description': 'বিবরণ',

  // -----------------------------------------------------------------------
  // Service Provider
  // -----------------------------------------------------------------------
  'provider.dashboard': 'সেবা প্রদানকারী ড্যাশবোর্ড',
  'provider.available': 'প্রাপ্য',
  'provider.unavailable': 'অপ্রাপ্য',
  'provider.accept': 'গ্রহণ',
  'provider.reject': 'প্রত্যাখ্যান',
  'provider.complete': 'সম্পন্ন',
  'provider.startProgress': 'কাজ শুরু করুন',
  'provider.sendQuote': 'কোটেশন পাঠান',
  'provider.noRequests': 'কোনো অপেক্ষমান অনুরোধ নেই।',
  'provider.noServices': 'এখনো কোনো সেবা তালিকাভুক্ত নেই।',
  'provider.quoteAmount': 'কোটেশন পরিমাণ',
  'provider.pending': 'অপেক্ষমান',
  'provider.inProgress': 'চলমান',
  'provider.completed': 'সম্পন্ন',
  'provider.earnings': 'মোট আয়',
  'provider.activeJobs': 'সক্রিয় কাজ',
  'provider.availableForJobs': 'কাজের জন্য প্রস্তুত',
  'provider.serviceRequests': 'সেবা অনুরোধ',
  'provider.myServices': 'আমার সেবা',
  'provider.viewDetails': 'বিস্তারিত দেখুন',
  'provider.noPendingRequests': 'কোনো অপেক্ষমান অনুরোধ নেই।',
  'provider.noJobsInProgress': 'কোনো চলমান কাজ নেই।',
  'provider.noCompletedJobs': 'এখনো কোনো সম্পন্ন কাজ নেই।',
  'provider.accepted': 'সেবা অনুরোধ গৃহীত হয়েছে!',
  'provider.markedCompleted': 'সেবা সম্পন্ন হিসেবে চিহ্নিত!',
  'provider.nowAvailable': 'আপনি এখন কাজের জন্য প্রস্তুত',
  'provider.nowOffline': 'আপনি এখন অফলাইন',

  // -----------------------------------------------------------------------
  // Medical
  // -----------------------------------------------------------------------
  'medical.doctors': 'চিকিৎসক',
  'medical.appointments': 'অ্যাপয়েন্টমেন্ট',
  'medical.reports': 'রিপোর্ট',
  'medical.bookAppointment': 'অ্যাপয়েন্টমেন্ট বুক করুন',
  'medical.specialty': 'বিশেষত্ব',
  'medical.fee': 'ফি',
  'medical.availableSlots': 'ফাঁকা সময়',
  'medical.scheduleDate': 'তারিখ নির্ধারণ করুন',
  'medical.scheduleTime': 'সময় নির্ধারণ করুন',

  // -----------------------------------------------------------------------
  // Review
  // -----------------------------------------------------------------------
  'review.writeReview': 'রিভিউ লিখুন',
  'review.submit': 'জমা দিন',
  'review.cancel': 'বাতিল',
  'review.comment': 'মন্তব্য',
  'review.rating': 'রেটিং',
  'review.noReviews': 'এখনো কোনো রিভিউ নেই',

  // -----------------------------------------------------------------------
  // General
  // -----------------------------------------------------------------------
  'general.loading': 'লোড হচ্ছে...',
  'general.error': 'কিছু একটা সমস্যা হয়েছে',
  'general.retry': 'আবার চেষ্টা করুন',
  'general.noData': 'কোনো তথ্য নেই',
  'general.save': 'সংরক্ষণ',
  'general.cancel': 'বাতিল',
  'general.confirm': 'নিশ্চিত করুন',
  'general.close': 'বন্ধ করুন',
  'general.search': 'খুঁজুন',
  'general.all': 'সব',
  'general.filter': 'ফিল্টার',
  'general.sort': 'সাজান',
  'general.viewDetails': 'বিস্তারিত দেখুন',
  'general.back': 'ফিরুন',

  // -----------------------------------------------------------------------
  // Landing Page
  // -----------------------------------------------------------------------
  'landing.hero': 'আপনার সব-এক প্ল্যাটফর্ম',
  'landing.features': 'বৈশিষ্ট্যসমূহ',
  'landing.howItWorks': 'কীভাবে কাজ করে',
  'landing.testimonials': 'ব্যবহারকারীদের মতামত',
  'landing.cta': 'শুরু করুন',
  'landing.trust': 'হাজারো মানুষের বিশ্বাসভাজন',

  // -----------------------------------------------------------------------
  // Consumer Dashboard (specific)
  // -----------------------------------------------------------------------
  'consumer.welcome': 'স্বাগতম',
  'consumer.recommendedForYou': 'আপনার জন্য প্রস্তাবিত',
  'consumer.popularServicesNearYou': 'আপনার কাছে জনপ্রিয় সেবা',
  'consumer.noOrdersYet': 'এখনো কোনো অর্ডার নেই। শপিং শুরু করুন!',
  'consumer.noProductsFound': 'কোনো পণ্য পাওয়া যায়নি।',
  'consumer.noServicesNearby': 'কাছাকাছি কোনো সেবা পাওয়া যায়নি।',
  'consumer.bookNow': 'এখনই বুক করুন',
  'consumer.item': 'পণ্য',
  'consumer.items': 'পণ্যসমূহ',
};

export default bn;