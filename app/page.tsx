'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlusCircle, Search, Pill, Eye, Edit3, Folder, Layers } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Medication {
  id: number | string;
  generic_name: string;
  brand_names: string;
  drug_class: string;
  body_system: string;
  folder: string;
}

export default function DashboardPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('medications')
      .select('id, generic_name, brand_names, drug_class, body_system, folder')
      .order('generic_name', { ascending: true });

    if (error) {
      console.error('Error fetching medications:', error);
    } else {
      setMedications(data || []);
    }
    setLoading(false);
  };

  // Extract unique folders dynamically from your saved medications
  const folders = ['ALL', ...Array.from(new Set(medications.map(m => m.folder || 'Unassigned')))];

  // Filter by search query AND selected folder
  const filteredMeds = medications.filter(med => {
    const matchesSearch = 
      med.generic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.brand_names?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.drug_class?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.body_system?.toLowerCase().includes(searchQuery.toLowerCase());

    const medFolder = med.folder || 'Unassigned';
    const matchesFolder = selectedFolder === 'ALL' || medFolder === selectedFolder;

    return matchesSearch && matchesFolder;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2 text-slate-900">
              <Pill className="w-8 h-8 text-blue-600" /> Pharmacology Reference
            </h1>
            <p className="text-sm text-slate-500 mt-1">Didactic classes, clinical rotations, and alphabetical drug database.</p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <PlusCircle className="w-5 h-5" /> Add New Medication
          </Link>
        </div>

        {/* Folder / Class Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          {folders.map((folderName) => (
            <button
              key={folderName}
              onClick={() => setSelectedFolder(folderName)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFolder === folderName
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {folderName === 'ALL' ? <Layers className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5" />}
              {folderName === 'ALL' ? 'Full Master List (Clinical)' : folderName}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medications alphabetically..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 text-sm"
          />
        </div>

        {/* Medication List */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading directory...</div>
        ) : filteredMeds.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <p className="text-slate-600 font-medium">No medications found in this view.</p>
            <p className="text-sm text-slate-400 mt-1">Try selecting a different folder or clearing your search.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {filteredMeds.map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between p-4 md:p-5 hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      {med.generic_name}
                    </h2>
                    {med.folder && selectedFolder === 'ALL' && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                        {med.folder}
                      </span>
                    )}
                    {med.body_system && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {med.body_system}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-700">Brands:</span> {med.brand_names || 'None listed'}
                  </p>
                </div>

                {/* View and Edit Links */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/view/${med.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                  <Link
                    href={`/edit/${med.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}