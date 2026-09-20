'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, MessageCircle, Users, BarChart3, Grid, Settings, CreditCard, Menu } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const links: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { href: '/app/today', label: 'Today', icon: Home },
    { href: '/app/ask', label: 'Ask', icon: MessageCircle },
    { href: '/app/people', label: 'People', icon: Users },
    { href: '/app/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/app/dashboard', label: 'Dashboard', icon: Grid },
    { href: '/app/settings', label: 'Settings', icon: Settings },
    { href: '/app/billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-600 to-teal-600 text-white border-t border-green-700 shadow-2xl z-40">
        <div className="flex justify-around items-center">
          {links.slice(0, 4).map((link) => {
            const IconComponent = link.icon;
            return (
              <Link key={link.href} href={link.href as any} className="flex-1 py-4 px-2 text-center hover:bg-white/20 active:bg-white/30 transition-all flex flex-col items-center gap-1 text-xs font-semibold min-h-16" onClick={() => setIsOpen(false)}>
                <IconComponent className="w-6 h-6" />
                <span className="line-clamp-1 text-xs">{link.label}</span>
              </Link>
            );
          })}
          <button onClick={() => setIsOpen(!isOpen)} className="flex-1 py-4 px-2 text-center hover:bg-white/20 active:bg-white/30 transition-all flex flex-col items-center gap-1 text-xs font-semibold min-h-16">
            <Menu className="w-6 h-6" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 space-y-2">
            {links.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link key={link.href} href={link.href as any} className="flex items-center py-3 px-4 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all text-sm font-medium" onClick={() => setIsOpen(false)}>
                  <IconComponent className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <button onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/'))} className="w-full py-3 px-4 rounded-lg hover:bg-red-100 active:bg-red-200 text-red-600 font-semibold transition-all text-sm">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
