// Multilingual support for Recall AI
// Supported languages: en (English), hi (Hindi), ar (Arabic)

export type Language = 'en' | 'hi' | 'ar';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation
    'nav.today': 'Today',
    'nav.ask': 'Ask',
    'nav.people': 'People',
    'nav.analytics': 'Analytics',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign Out',

    // Today Page
    'today.title': "Today's Memories",
    'today.capture': 'Capture Memory',
    'today.placeholder': 'Tell me what you need to remember...',
    'today.search': 'Search your memories...',
    'today.record': 'Record Voice',
    'today.test': 'Test Demo',
    'today.upload': 'Upload Files',
    'today.extracting': '⏳ Extracting...',
    'today.capture_extract': 'Capture & Extract',

    // Categories
    'category.needs_attention': 'Needs Attention',
    'category.due_today': 'Due Today',
    'category.coming_up': 'Coming Up',
    'category.other': 'Other',

    // People
    'people.title': 'People',
    'people.subtitle': 'Track your relationships and follow-ups',
    'people.add': '+ Add Person',
    'people.frequency': 'Frequency',
    'people.last_contact': 'Last Contact',
    'people.no_people': 'No people tracked yet',

    // Analytics
    'analytics.title': 'Analytics',
    'analytics.subtitle': 'Your memory and productivity insights',
    'analytics.total_memories': 'Total Memories',
    'analytics.total_people': 'People',
    'analytics.avg_interactions': 'Avg Interactions',
    'analytics.completion_rate': 'Completion Rate',
    'analytics.overdue': 'Overdue',
    'analytics.due_today': 'Due Today',
    'analytics.coming_up': 'Coming Up',
    'analytics.priority': 'Priority Distribution',
    'analytics.sources': 'Capture Sources',
    'analytics.activity': 'Capture Activity (Last 7 Days)',

    // Settings
    'settings.title': 'Preferences',
    'settings.subtitle': 'Customize how you receive your daily brief and notifications',
    'settings.daily_brief': 'Daily Brief Email',
    'settings.send_at': 'Send at (UTC)',
    'settings.frequency': 'Frequency',
    'settings.timezone': 'Timezone',
    'settings.quiet_hours': 'Quiet Hours',
    'settings.notifications': 'Notifications',
    'settings.save': '💾 Save Settings',
    'settings.reset': '↺ Reset',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
  },
  hi: {
    // Navigation
    'nav.today': 'आज',
    'nav.ask': 'पूछें',
    'nav.people': 'लोग',
    'nav.analytics': 'विश्लेषण',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.settings': 'सेटिंग्स',
    'nav.signOut': 'साइन आउट',

    // Today Page
    'today.title': 'आज की यादें',
    'today.capture': 'यादें कैप्चर करें',
    'today.placeholder': 'मुझे बताएं कि आपको क्या याद रखना है...',
    'today.search': 'अपनी यादों में खोजें...',
    'today.record': 'वॉइस रिकॉर्ड करें',
    'today.test': 'परीक्षण डेमो',
    'today.upload': 'फाइलें अपलोड करें',
    'today.extracting': '⏳ निष्कर्षण...',
    'today.capture_extract': 'कैप्चर करें और निष्कर्षण करें',

    // Categories
    'category.needs_attention': 'ध्यान चाहिए',
    'category.due_today': 'आज का काम',
    'category.coming_up': 'जल्दी आने वाला',
    'category.other': 'अन्य',

    // People
    'people.title': 'लोग',
    'people.subtitle': 'अपने संबंधों और अनुवर्तन को ट्रैक करें',
    'people.add': '+ व्यक्ति जोड़ें',
    'people.frequency': 'आवृत्ति',
    'people.last_contact': 'अंतिम संपर्क',
    'people.no_people': 'अभी कोई लोग ट्रैक नहीं किए गए हैं',

    // Analytics
    'analytics.title': 'विश्लेषण',
    'analytics.subtitle': 'आपकी स्मृति और उत्पादकता अंतर्दृष्टि',
    'analytics.total_memories': 'कुल यादें',
    'analytics.total_people': 'लोग',
    'analytics.avg_interactions': 'औसत इंटरैक्शन',
    'analytics.completion_rate': 'पूर्णता दर',
    'analytics.overdue': 'अतिदेय',
    'analytics.due_today': 'आज का काम',
    'analytics.coming_up': 'जल्दी आने वाला',
    'analytics.priority': 'प्राथमिकता वितरण',
    'analytics.sources': 'कैप्चर स्रोत',
    'analytics.activity': 'कैप्चर गतिविधि (पिछले 7 दिन)',

    // Settings
    'settings.title': 'प्राथमिकताएं',
    'settings.subtitle': 'अपने दैनिक संक्षेप और सूचनाओं को कस्टमाइज़ करें',
    'settings.daily_brief': 'दैनिक संक्षेप ईमेल',
    'settings.send_at': 'भेजें (UTC)',
    'settings.frequency': 'आवृत्ति',
    'settings.timezone': 'समय क्षेत्र',
    'settings.quiet_hours': 'शांत घंटे',
    'settings.notifications': 'सूचनाएं',
    'settings.save': '💾 सेटिंग्स सहेजें',
    'settings.reset': '↺ रीसेट करें',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.delete': 'हटाएं',
  },
  ar: {
    // Navigation
    'nav.today': 'اليوم',
    'nav.ask': 'اسأل',
    'nav.people': 'الناس',
    'nav.analytics': 'التحليلات',
    'nav.dashboard': 'لوحة المعلومات',
    'nav.settings': 'الإعدادات',
    'nav.signOut': 'تسجيل الخروج',

    // Today Page
    'today.title': 'ذكريات اليوم',
    'today.capture': 'التقط الذاكرة',
    'today.placeholder': 'أخبرني بما تريد أن تتذكره...',
    'today.search': 'ابحث في ذكرياتك...',
    'today.record': 'تسجيل صوتي',
    'today.test': 'اختبار تجريبي',
    'today.upload': 'تحميل الملفات',
    'today.extracting': '⏳ جاري الاستخراج...',
    'today.capture_extract': 'التقط واستخرج',

    // Categories
    'category.needs_attention': 'يحتاج انتباه',
    'category.due_today': 'استحق اليوم',
    'category.coming_up': 'قادم قريبا',
    'category.other': 'آخرى',

    // People
    'people.title': 'الناس',
    'people.subtitle': 'تتبع علاقاتك والمتابعات',
    'people.add': '+ إضافة شخص',
    'people.frequency': 'التكرار',
    'people.last_contact': 'آخر تواصل',
    'people.no_people': 'لا يوجد أشخاص يتم تتبعهم حتى الآن',

    // Analytics
    'analytics.title': 'التحليلات',
    'analytics.subtitle': 'رؤى الذاكرة والإنتاجية الخاصة بك',
    'analytics.total_memories': 'إجمالي الذكريات',
    'analytics.total_people': 'الناس',
    'analytics.avg_interactions': 'متوسط التفاعلات',
    'analytics.completion_rate': 'معدل الإتمام',
    'analytics.overdue': 'متأخر',
    'analytics.due_today': 'استحق اليوم',
    'analytics.coming_up': 'قادم قريبا',
    'analytics.priority': 'توزيع الأولويات',
    'analytics.sources': 'مصادر الالتقاط',
    'analytics.activity': 'نشاط الالتقاط (آخر 7 أيام)',

    // Settings
    'settings.title': 'التفضيلات',
    'settings.subtitle': 'تخصيص كيفية استقبالك لملخص يومك والإشعارات',
    'settings.daily_brief': 'بريد ملخص يومي',
    'settings.send_at': 'الإرسال في (UTC)',
    'settings.frequency': 'التكرار',
    'settings.timezone': 'المنطقة الزمنية',
    'settings.quiet_hours': 'ساعات الهدوء',
    'settings.notifications': 'الإشعارات',
    'settings.save': '💾 حفظ الإعدادات',
    'settings.reset': '↺ إعادة تعيين',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجاح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
  },
};

export function useTranslation(lang: Language = 'en') {
  return {
    t: (key: string, defaultValue?: string) => {
      return translations[lang]?.[key] || translations['en']?.[key] || defaultValue || key;
    },
    lang,
  };
}

export function getAvailableLanguages() {
  return [
    { code: 'en', name: 'English', direction: 'ltr' },
    { code: 'hi', name: 'हिन्दी', direction: 'ltr' },
    { code: 'ar', name: 'العربية', direction: 'rtl' },
  ];
}

export function getLanguageDirection(lang: Language) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
