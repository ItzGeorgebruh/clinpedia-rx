'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlusCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminAddDrug() {
  const [formData, setFormData] = useState({
    system: 'Cardiovascular',
    class_name: '',
    generic_name: '',
    brand_name: '',
    moa: '',
    indications: '',
    routes: '',
    adverse_effects: '',
    contraindications: '',
    patient_counseling: '',
    clinical_pearls: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    const payload = {
      ...formData,
      indications: formData.indications.split(',').map((item: string) => item.trim()),
      routes: formData.routes.split(',').map((item: string) => item.trim()),
      adverse_effects: formData.adverse_effects.split(',').map((item: string) => item.trim()),
      contraindications: formData.contraindications.split(',').map((item: string) => item.trim()),
      patient_counseling: formData.patient_counseling.split(',').map((item: string) => item.trim()),
    };

    const { error } = await supabase.from('drugs').insert([payload]);

    if (error) {
      console.error('Error inserting drug:', error);
      alert('Error adding drug. Check console for details.');
    } else {
      setSuccessMessage('Medication successfully added to the database!');
      setFormData({
        system: 'Cardiovascular',
        class_name: '',
        generic_name: '',
        brand_name: '',
        moa: '',
        indications: '',
        routes: '',
        adverse_effects: '',
        contraindications: '',
        patient_counseling: '',
        clinical_pearls: ''
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Drug Reference Dashboard
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <PlusCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Add New Medication</h1>
              <p className="text-sm text-slate-500">Enter high-yield clinical pharmacology data. Use commas to separate multiple items.</p>
            </div>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Body System / Specialty</label>
                <select 
                  name="system" 
                  value={formData.system} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                >
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="Endocrine">Endocrine</option>
                  <option value="Central Nervous System">Central Nervous System</option>
                  <option value="Renal">Renal</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                  <option value="Psychiatry">Psychiatry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Drug Class</label>
                <input 
                  type="text" 
                  name="class_name" 
                  required
                  value={formData.class_name} 
                  onChange={handleChange}
                  placeholder="e.g., ACE Inhibitors"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Generic Name</label>
                <input 
                  type="text" 
                  name="generic_name" 
                  required
                  value={formData.generic_name} 
                  onChange={handleChange}
                  placeholder="e.g., Lisinopril"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name(s)</label>
                <input 
                  type="text" 
                  name="brand_name" 
                  required
                  value={formData.brand_name} 
                  onChange={handleChange}
                  placeholder="e.g., Prinivil, Zestril"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mechanism of Action (MOA)</label>
              <textarea 
                name="moa" 
                rows={2} 
                required
                value={formData.moa} 
                onChange={handleChange}
                placeholder="Detailed pharmacological mechanism..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Indications (comma-separated)</label>
                <input 
                  type="text" 
                  name="indications" 
                  required
                  value={formData.indications} 
                  onChange={handleChange}
                  placeholder="Hypertension, Heart Failure"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Routes (comma-separated)</label>
                <input 
                  type="text" 
                  name="routes" 
                  required
                  value={formData.routes} 
                  onChange={handleChange}
                  placeholder="Oral, IV"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adverse Effects (comma-separated)</label>
                <input 
                  type="text" 
                  name="adverse_effects" 
                  required
                  value={formData.adverse_effects} 
                  onChange={handleChange}
                  placeholder="Dry cough, Hyperkalemia"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contraindications (comma-separated)</label>
                <input 
                  type="text" 
                  name="contraindications" 
                  required
                  value={formData.contraindications} 
                  onChange={handleChange}
                  placeholder="Pregnancy, Angioedema history"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Counseling Tips (comma-separated)</label>
              <textarea 
                name="patient_counseling" 
                rows={2} 
                required
                value={formData.patient_counseling} 
                onChange={handleChange}
                placeholder="Rise slowly from sitting positions"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Pearls (Optional)</label>
              <input 
                type="text" 
                name="clinical_pearls" 
                value={formData.clinical_pearls} 
                onChange={handleChange}
                placeholder="High-yield board note..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving to Database...' : 'Save Medication'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}