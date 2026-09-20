'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export const MainNav = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  const navItems = [
    { href: '/today', label: 'Today' },
    { href: '/memories', label: 'Memories' },
    { href: '/ask-recall', label: 'Ask Recall' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/today" className="text-2xl font-bold text-indigo-600">
              Recall AI
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center">
            <button
              onClick={() => signOut()}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
