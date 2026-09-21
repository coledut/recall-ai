'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NavProps {
  currentPage?: string;
}

interface NavItem {
  name: string;
  href: any;
  key: string;
}

export default function PremiumNav({ currentPage = 'today' }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { name: 'Today', href: '/app/today', key: 'today' },
    { name: 'Ask', href: '/app/ask', key: 'ask' },
    { name: 'People', href: '/app/people', key: 'people' },
    { name: 'Analytics', href: '/app/analytics', key: 'analytics' },
    { name: 'Settings', href: '/app/settings', key: 'settings' },
    { name: 'Billing', href: '/app/billing', key: 'billing' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-collapse {
            display: none;
          }
          .nav-collapse.open {
            display: flex;
          }
        }
      `}</style>

      {/* Premium Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-purple-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-4">
            {/* Logo & Brand */}
            <Link href="/app/today" className="flex-shrink-0 group">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <span className="text-white font-bold text-lg sm:text-xl">i</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    iRecall
                  </div>
                  <div className="text-xs text-purple-600 font-semibold">AI</div>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 flex-1 ml-8">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-3 lg:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    currentPage === item.key
                      ? 'bg-purple-100 text-purple-700 shadow-sm'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Action Button */}
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-purple-50 rounded-lg transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`nav-collapse ${mobileMenuOpen ? 'open' : ''} md:hidden flex-col gap-2 mt-3 pb-3 border-t border-purple-200/50 pt-3`}
          >
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                  currentPage === item.key
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="px-3 py-2.5 text-left text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
