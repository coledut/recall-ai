'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Users as UsersIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PremiumNav from '@/app/components/PremiumNav';

interface Person {
  id: string;
  name: string;
  email?: string;
  company?: string;
  role?: string;
  relationship: string;
  priority: string;
  interaction_count: number;
  last_contact_date: string;
  created_at: string;
  notes?: string;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'last_contact_date' | 'interaction_count' | 'name'>('last_contact_date');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    relationship: 'contact',
  });

  useEffect(() => {
    loadPeople();
  }, [sortBy]);

  const loadPeople = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch(`/api/people?sort=${sortBy}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPeople(data.people || []);
      }
    } catch (error) {
      console.error('Failed to load people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', email: '', company: '', role: '', relationship: 'contact' });
        setShowForm(false);
        await loadPeople();
      }
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <PremiumNav currentPage="people" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8 reveal-up">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">People</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Track your relationships and follow-ups</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-premium px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold text-sm rounded-lg hover-lift w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Person
              </>
            )}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="card-premium bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-purple-200 mb-8 reveal-up">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Add New Person</h3>
            <form onSubmit={handleAddPerson} className="space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-premium w-full text-xs sm:text-sm"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-premium w-full text-xs sm:text-sm"
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input-premium w-full text-xs sm:text-sm"
              />
              <input
                type="text"
                placeholder="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-premium w-full text-xs sm:text-sm"
              />
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="input-premium w-full text-xs sm:text-sm"
              >
                <option value="contact">Contact</option>
                <option value="colleague">Colleague</option>
                <option value="mentor">Mentor</option>
                <option value="friend">Friend</option>
              </select>
              <button
                type="submit"
                className="btn-premium w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover-lift text-sm"
              >
                Add Person
              </button>
            </form>
          </div>
        )}

        {/* Sorting Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap reveal-up">
          {[
            { key: 'last_contact_date', label: 'Last Contact' },
            { key: 'interaction_count', label: 'Frequency' },
            { key: 'name', label: 'Name' },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setSortBy(btn.key as any)}
              className={`btn-premium px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-smooth ${
                sortBy === btn.key
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-400'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* People Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-loader h-40 sm:h-48 rounded-lg" />
            ))}
          </div>
        ) : people.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-purple-200 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-600">No people tracked yet</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Add people manually or they'll be extracted from memories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {people.map((person, idx) => (
              <div
                key={person.id}
                className="card-premium bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-purple-200 hover-lift reveal-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1">{person.name}</h3>
                  {person.company && <p className="text-xs sm:text-sm text-gray-600">{person.company}</p>}
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-gray-700 mb-4">
                  {person.role && <p><span className="font-semibold">Role:</span> {person.role}</p>}
                  <p><span className="font-semibold">Interactions:</span> {person.interaction_count}</p>
                  <p><span className="font-semibold">Last Contact:</span> {new Date(person.last_contact_date).toLocaleDateString()}</p>
                </div>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {person.relationship}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
