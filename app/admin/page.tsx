'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlusCircle, ArrowLeft, CheckCircle2, Sparkles, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { GoogleGenAI } from '@google/genai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export default function AdminAddDrug() {
  const [darkMode, setDarkMode] = useState(false);
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
  const [aiLoading, setAiLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAIGenerate = async () => {
    if (!formData.generic_name) {
      alert('Please enter at least a generic drug name first (e.g., Lisinopril)!');
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Provide high-yield clinical pharmacology data for the medication "${formData.generic_name}". 
      Return ONLY a valid JSON object with the following exact keys, where array values should be comma-separated strings:
      {
        "system": "Choose one from: Cardiovascular, Respiratory, Endocrine, Central Nervous System, Renal, Gastrointestinal, Psychiatry",
        "class_name": "Drug class name",
        "brand_name": "Common brand names separated by commas",
        "moa": "Detailed mechanism of action description",
        "indications": "Indication 1, Indication 2, Indication 3",
        "routes": "Oral, IV, etc.",
        "adverse_effects": "Effect 1, Effect 2",
        "contraindications": "Contraindication 1, Contraindication 2",
        "patient_counseling": "Counseling tip 1, Counseling tip 2",
        "clinical_pearls": "High-yield board exam clinical pearl"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash model',
        contents: prompt,
      });

      const textResponse = response.text;
      if (!textResponse) throw new Error('No response from AI');

      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      setFormData(prev => ({
        ...prev,
        system: parsedData.system || prev.system,
        class_name: parsedData.class_name || prev.class_name,
        brand_name: parsedData.brand_name || prev.brand_name,
        moa: parsedData.moa || prev.moa,
        indications: parsedData.indications || prev.indications,
        routes: parsedData.routes || prev.routes,
        adverse_effects: parsedData.adverse_effects || prev.adverse_effects,
        contraindications: parsedData.contraindications || prev.contraindications,
        patient_counseling: parsedData.patient_counseling || prev.patient_counseling,
        clinical_pearls: parsedData.clinical_pearls || prev.clinical_pearls,
      }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AI generation error:', err);
      alert('Failed to generate data with AI.');
    }
    setAiLoading(false);
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
      // eslint-disable-next-line no-console
      console.error('Error inserting drug:', error);
      alert('Error adding drug.');
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
    <div className={`min-h-screen p-6 font-sans transition-colors ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className={`inline-flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-blue-600'}`}>
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} 
            {darkMode ? 'Light Mode' : 'Night Mode'}
          </button>
        </div>

        <div className={`border rounded-2xl p-8 shadow-sm transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-700/20">
            <div className="flex items-center gap-3">
              <PlusCircle className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Add New Medication</h1>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Type a generic name and let AI fill out the rest.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={aiLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {aiLoading ? 'Generating...' : '✨ Auto-Fill with AI'}
            </button>
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
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Body System</label>
                <select 
                  name="system" 
                  value={formData.system} 
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-medium ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
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
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Drug Class</label>
                <input 
                  type="text" 
                  name="class_name" 
                  required
                  value={formData.class_name} 
                  onChange={handleChange}
                  placeholder="e.g., ACE Inhibitors"
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-900 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Generic Name</label>
                <input 
                  type="text" 
                  name="generic_name" 
                  required
                  value={formData.generic_name} 
                  onChange={handleChange}
                  placeholder="e.g., Lisinopril"
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-900 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Brand Name(s)</label>
                <input 
                  type="text" 
                  name="brand_name" 
                  required
                  value={formData.brand_name} 
                  onChange={handleChange}
                  placeholder="e.g., Prinivil, Zestril"
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-900 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Mechanism of Action (MOA)</label>
              <textarea 
                name="moa" 
                rows={2} 
                required
                value={formData.moa} 
                onChange={handleChange}
                placeholder="Detailed mechanism..."
                className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-900 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Indications (comma-separated)</label>
                <input 
                  type="text" 
                  name="indications" 
                  required
                  value={formData.indications} 
                  onChange={handleChange}
                  placeholder="Hypertension, Heart Failure"
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-900 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Routes (comma-separated)</label>
                <input 
                  type="text" 
                  name="routes" 
                  required
                  value={formData.routes} 
                  onChange={handleChange}
                  placeholder="Oral, IV"
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-900 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Adverse Effects (comma-separated)</label>
                <input 
                  type="text" 
                  name="adverse_effects" 
                  required
                  value={formData.adverse_effects} 
                  onChange={handleChange}
                  placeholder="Dry cough, Hyperkalemia"
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-900 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Contraindications (comma-separated)</label>
                <input 
                  type="text" 
                  name="contraindications" 
                  required
                  value={formData.contraindications} 
                  onChange={handleChange}
                  placeholder="Pregnancy, Angioedema"
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-900 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Patient Counseling Tips (comma-separated)</label>
              <textarea 
                name="patient_counseling" 
                rows={2} 
                required
                value={formData.patient_counseling} 
                onChange={handleChange}
                placeholder="Rise slowly from sitting..."
                className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-900 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Clinical Pearls</label>
              <input 
                type="text" 
                name="clinical_pearls" 
                value={formData.clinical_pearls} 
                onChange={handleChange}
                placeholder="High-yield board note..."
                className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-900 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
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