'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Pill, Stethoscope, Activity, Plus } from 'lucide-react';
import Link from 'next/link';

interface Drug {
  id: number;
  system: string;
  className: string;
  generic: string;
  brand: string;
  moa: string;
  indications: string[];
  routes: string[];
  adverseEffects: string[];
  contraindications: string[];
  counseling: string[];
  pearls?: string;
}

export default function ClinicalPharmacologyApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('All');
  const [drugs, setDrugs] = useState<Drug[]>([]);

  useEffect(() => {
    setDrugs([
      {
        id: 1,
        system: 'Cardiovascular',
        className: 'ACE Inhibitors',
        generic: 'Lisinopril',
        brand: 'Prinivil, Zestril',
        moa: 'Inhibits ACE, decreasing aldosterone and preventing conversion of angiotensin I to II.',
        indications: ['Hypertension', 'Heart Failure', 'Post-MI'],
        routes: ['Oral'],
        adverseEffects: ['Dry persistent cough', 'Hyperkalemia', 'Angioedema', 'Hypotension'],
        contraindications: ['Pregnancy', 'History of angioedema', 'Bilateral renal artery stenosis'],
        counseling: ['Rise slowly to prevent orthostatic hypotension', 'Avoid potassium supplements without consulting provider'],
        pearls: 'Monitor serum creatinine and potassium within 1-2 weeks of initiation.'
      },
      {
        id: 2,
        system: 'Respiratory',
        className: 'Beta-2 Agonists (SABA)',
        generic: 'Albuterol',
        brand: 'ProAir, Ventolin',
        moa: 'Stimulates beta-2 adrenergic receptors in bronchial smooth muscle resulting in bronchodilation.',
        indications: ['Acute bronchospasm', 'Asthma exacerbation', 'Exercise-induced bronchospasm'],
        routes: ['Inhalation (MDI/Nebulizer)', 'Oral'],
        adverseEffects: ['Tremors', 'Tachycardia', 'Palpitations', 'Nervousness'],
        contraindications: ['Hypersensitivity to sympathomimetic amines'],
        counseling: ['Prime inhaler before first use', 'Rinse mouth if used with steroid inhalers'],
        pearls: 'Primary rescue medication; frequent reliance (>2x/week) indicates poor asthma control.'
      }
    ]);
  }, []);

  const filteredDrugs = drugs.filter((drug: Drug) => {
    const matchesSearch = drug.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          drug.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          drug.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSystem = selectedSystem === 'All' || drug.system === selectedSystem;
    return matchesSearch && matchesSystem;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">ClinPedia Rx</h1>
          </div>
          <p className="text-slate-600">High-yield clinical pharmacology reference grouped by medical specialty and body system.</p>
        </div>
        <Link 
          href="/admin" 
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Drug
        </Link>
      </header>

      {/* Search & Filter Bar */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by generic name, brand, or drug class..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select 
          value={selectedSystem} 
          onChange={(e) => setSelectedSystem(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
        >
          <option value="All">All Systems / Specialties</option>
          <option value="Cardiovascular">Cardiovascular</option>
          <option value="Respiratory">Respiratory</option>
          <option value="Endocrine">Endocrine</option>
          <option value="Central Nervous System">Central Nervous System</option>
          <option value="Renal">Renal</option>
          <option value="Gastrointestinal">Gastrointestinal</option>
          <option value="Psychiatry">Psychiatry</option>
        </select>
      </div>

      {/* Drug Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDrugs.map(drug => (
          <div key={drug.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                  {drug.system}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{drug.generic}</h3>
                <p className="text-sm font-medium text-slate-500">Brand: {drug.brand} ({drug.className})</p>
              </div>
              <Pill className="w-6 h-6 text-slate-400" />
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <strong className="text-slate-900">MOA:</strong> {drug.moa}
              </div>
              <div>
                <strong className="text-slate-900">Indications:</strong> {drug.indications.join(', ')}
              </div>
              <div>
                <strong className="text-slate-900">Routes:</strong> {drug.routes.join(', ')}
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-red-900">
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Adverse Effects & Contraindications
                </div>
                <p><strong>AE:</strong> {drug.adverseEffects.join(', ')}</p>
                <p className="mt-1"><strong>Contraindications:</strong> {drug.contraindications.join(', ')}</p>
              </div>
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-slate-800">
                <strong className="text-blue-900 block mb-1">Patient Counseling:</strong>
                <ul className="list-disc pl-4 space-y-1">
                  {drug.counseling.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
              {drug.pearls && (
                <div className="text-xs italic text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                  <strong>Clinical Pearl:</strong> {drug.pearls}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}