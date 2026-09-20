'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/app/today', label: 'Today', icon: '📋' },
    { href: '/app/ask', label: 'Ask', icon: '💬' },
    { href: '/app/people', label: 'People', icon: '👥' },
    { href: '/app/analytics', label: 'Analytics', icon: '📊' },
    { href: '/app/dashboard', label: 'Dashboard', icon: '📈' },
    { href: '/app/settings', label: 'Settings', icon: '⚙️' },
    { href: '/app/billing', label: 'Billing', icon: '💳' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-600 to-teal-600 text-white border-t border-green-700 shadow-2xl">
        <div className="flex justify-around items-center">
          {links.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex-1 py-3 px-2 text-center hover:bg-white/20 transition-all flex flex-col items-center gap-1 text-xs font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="line-clamp-1">{link.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 py-3 px-2 text-center hover:bg-white/20 transition-all flex flex-col items-center gap-1 text-xs font-semibold"
          >
            <span className="text-lg">≡</span>
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white shadow-lg z-50">
          <div className="p-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 px-4 rounded-lg hover:bg-gray-100 transition-all"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/'))}
              className="w-full py-3 px-4 rounded-lg hover:bg-red-100 text-red-600 font-semibold transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
