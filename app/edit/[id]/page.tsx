'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, CheckCircle2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EditMedicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [formData, setFormData] = useState({
    generic_name: '',
    brand_names: '',
    drug_class: '',
    body_system: 'Cardiovascular',
    folder: 'Pharmacology I',
    mechanism_of_action: '',
    indications: '',
    routes: '',
    pediatric_dosage: '', // <-- Added pediatric dosage
    adverse_effects: '',
    contraindications: '',
    patient_counseling: '',
    clinical_pearls: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMedication();
    }
  }, [id]);

  const fetchMedication = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching medication:', error);
      alert('Could not load medication details.');
    } else if (data) {
      setFormData({
        generic_name: data.generic_name || '',
        brand_names: data.brand_names || '',
        drug_class: data.drug_class || '',
        body_system: data.body_system || 'Cardiovascular',
        folder: data.folder || 'Pharmacology I',
        mechanism_of_action: data.mechanism_of_action || '',
        indications: data.indications || '',
        routes: data.routes || '',
        pediatric_dosage: data.pediatric_dosage || '',
        adverse_effects: data.adverse_effects || '',
        contraindications: data.contraindications || '',
        patient_counseling: data.patient_counseling || '',
        clinical_pearls: data.clinical_pearls || '',
      });
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('medications')
      .update(formData)
      .eq('id', id);

    setSaving(false);
    if (error) {
      alert('Error updating medication: ' + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/');
      }, 1500);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting medication: ' + error.message);
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading medication details...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-slate-200">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Edit Medication: {formData.generic_name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Update clinical data, pediatric dosage, or remove this entry.</p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-100 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Medication successfully updated! Returning to dashboard...
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Generic Name</label>
              <input
                type="text"
                name="generic_name"
                value={formData.generic_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Body System / Specialty</label>
                <select
                  name="body_system"
                  value={formData.body_system}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Pulmonary">Pulmonary</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Endocrine">Endocrine</option>
                  <option value="Infectious Disease">Infectious Disease</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                  <option value="Renal">Renal</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Hematology">Hematology</option>
                  <option value="Musculoskeletal">Musculoskeletal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Didactic Class / Folder</label>
                <input
                  type="text"
                  name="folder"
                  value={formData.folder}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Drug Class</label>
                <input
                  type="text"
                  name="drug_class"
                  value={formData.drug_class}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Brand Name(s)</label>
                <input
                  type="text"
                  name="brand_names"
                  value={formData.brand_names}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Mechanism of Action (MOA)</label>
              <textarea
                name="mechanism_of_action"
                value={formData.mechanism_of_action}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Indications</label>
                <input
                  type="text"
                  name="indications"
                  value={formData.indications}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Routes</label>
                <input
                  type="text"
                  name="routes"
                  value={formData.routes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Pediatric Dosage</label>
              <input
                type="text"
                name="pediatric_dosage"
                value={formData.pediatric_dosage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Adverse Effects</label>
                <input
                  type="text"
                  name="adverse_effects"
                  value={formData.adverse_effects}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Contraindications</label>
                <input
                  type="text"
                  name="contraindications"
                  value={formData.contraindications}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Patient Counseling Tips</label>
              <textarea
                name="patient_counseling"
                value={formData.patient_counseling}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Clinical Pearls</label>
              <textarea
                name="clinical_pearls"
                value={formData.clinical_pearls}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm disabled:opacity-50 mt-4 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}