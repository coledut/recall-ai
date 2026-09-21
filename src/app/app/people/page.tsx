'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

  const getRelationshipColor = (relationship: string) => {
    const colors: Record<string, string> = {
      mentor: 'bg-purple-100 text-purple-800',
      colleague: 'bg-blue-100 text-blue-800',
      lead: 'bg-green-100 text-green-800',
      investor: 'bg-yellow-100 text-yellow-800',
      friend: 'bg-pink-100 text-pink-800',
      contact: 'bg-gray-100 text-gray-800',
    };
    return colors[relationship] || colors.contact;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffMs = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-purple-600 to-purple-700 text-white mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <h1 className="text-lg sm:text-2xl font-bold truncate">Recall AI</h1>
          <a href="/app/today" className="text-white text-xs sm:text-sm hover:text-green-100 font-semibold px-2 sm:px-4 py-2 rounded-lg hover:bg-white/20 whitespace-nowrap">
            ← Back
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">People</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Track your relationships and follow-ups</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold text-sm sm:text-base rounded-xl hover:shadow-lg transition-all whitespace-nowrap flex items-center justify-center gap-2">
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

        {/* Add Person Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Add New Person</h3>
            <form onSubmit={handleAddPerson} className="space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="contact">Contact</option>
                <option value="colleague">Colleague</option>
                <option value="mentor">Mentor</option>
                <option value="friend">Friend</option>
                <option value="lead">Lead</option>
                <option value="investor">Investor</option>
              </select>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Add Person
              </button>
            </form>
          </div>
        )}

        {/* Sorting */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button onClick={() => setSortBy('last_contact_date')} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${sortBy === 'last_contact_date' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>
            Last Contact
          </button>
          <button onClick={() => setSortBy('interaction_count')} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${sortBy === 'interaction_count' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>
            Frequency
          </button>
          <button onClick={() => setSortBy('name')} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${sortBy === 'name' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>
            Name
          </button>
        </div>

        {/* People Grid */}
        {loading ? (
          <p className="text-center text-gray-600 py-12">Loading...</p>
        ) : people.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">No people tracked yet</p>
            <p className="text-xs sm:text-sm text-gray-500">Add people manually or they'll be extracted from your memories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {people.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{person.name}</h3>
                    {person.company && (
                      <p className="text-sm text-gray-600">{person.company}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRelationshipColor(person.relationship)}`}>
                    {person.relationship}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {person.role && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Role:</span> {person.role}
                    </p>
                  )}
                  {person.email && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Email:</span> {person.email}
                    </p>
                  )}
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Interactions:</span> {person.interaction_count}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Last Contact:</span> {formatDate(person.last_contact_date)}
                  </p>
                </div>

                {/* Stats */}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500">Added {formatDate(person.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
