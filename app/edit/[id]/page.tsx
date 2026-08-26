'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EditDrug() {
  const params = useParams();
  const router = useRouter();
  const drugId = params.id;

  const [formData, setFormData] = useState({
    system: '',
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

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch the existing drug data on page load
  useEffect(() => {
    async function fetchDrug() {
      const { data, error } = await supabase
        .from('drugs')
        .select('*')
        .eq('id', drugId)
        .single();

      if (error) {
        console.error('Error fetching drug:', error);
      } else if (data) {
        setFormData({
          system: data.system || '',
          class_name: data.class_name || '',
          generic_name: data.generic_name || '',
          brand_name: data.brand_name || '',
          moa: data.moa || '',
          indications: Array.isArray(data.indications) ? data.indications.join(', ') : data.indications || '',
          routes: Array.isArray(data.routes) ? data.routes.join(', ') : data.routes || '',
          adverse_effects: Array.isArray(data.adverse_effects) ? data.adverse_effects.join(', ') : data.adverse_effects || '',
          contraindications: Array.isArray(data.contraindications) ? data.contraindications.join(', ') : data.contraindications || '',
          patient_counseling: Array.isArray(data.patient_counseling) ? data.patient_counseling.join(', ') : data.patient_counseling || '',
          clinical_pearls: data.clinical_pearls || ''
        });
      }
      setLoading(false);
    }

    if (drugId) fetchDrug();
  }, [drugId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      indications: formData.indications.split(',').map((item: string) => item.trim()),
      routes: formData.routes.split(',').map((item: string) => item.trim()),
      adverse_effects: formData.adverse_effects.split(',').map((item: string) => item.trim()),
      contraindications: formData.contraindications.split(',').map((item: string) => item.trim()),
      patient_counseling: formData.patient_counseling.split(',').map((item: string) => item.trim()),
    };

    const { error } = await supabase
      .from('drugs')
      .update(payload)
      .eq('id', drugId);

    if (error) {
      console.error('Error updating drug:', error);
      alert('Error updating drug. Check console.');
    } else {
      setSuccessMessage('Medication updated successfully!');
      setTimeout(() => {
        router.push('/');
      }, 1200);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading drug details...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Edit Medication</h1>
          <p className="text-sm text-slate-500 mb-6">Update the fields below to modify this entry in your database.</p>

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Body System</label>
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
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Pearls</label>
              <input 
                type="text" 
                name="clinical_pearls" 
                value={formData.clinical_pearls} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}