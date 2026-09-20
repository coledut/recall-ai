'use client';

import { useEffect, useState } from 'react';
import { getAvailableLanguages, type Language } from '@/lib/i18n';

interface LanguageSelectorProps {
  onLanguageChange?: (lang: Language) => void;
}

export default function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved language preference
    const saved = localStorage.getItem('language') as Language | null;
    if (saved) {
      setCurrentLang(saved);
      applyLanguage(saved);
    }
  }, []);

  const applyLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    const isRTL = lang === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    setCurrentLang(lang);
    onLanguageChange?.(lang);
  };

  const languages = getAvailableLanguages();

  if (!mounted) return null;

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => applyLanguage(lang.code as Language)}
          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
            currentLang === lang.code
              ? 'bg-white text-green-600 shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          title={lang.name}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
