'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlusCircle, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { GoogleGenAI } from '@google/genai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export default function AddMedicationPage() {
  const [formData, setFormData] = useState({
    generic_name: '',
    brand_names: '',
    drug_class: '',
    body_system: 'Cardiovascular',
    folder: 'Pharmacology I',
    mechanism_of_action: '',
    indications: '',
    routes: '',
    pediatric_dosage: '',
    adverse_effects: '',
    contraindications: '',
    patient_counseling: '',
    clinical_pearls: '',
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAIGenerate = async () => {
    if (!formData.generic_name.trim()) {
      alert('Please type a generic or brand medication name first!');
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Return ONLY a raw JSON object with clinical pharmacology details for the medication "${formData.generic_name}". Do NOT include any markdown code blocks, backticks, conversational filler, or extra text. Use these exact keys:
      {
        "generic_name": "string",
        "brand_names": "string",
        "drug_class": "string",
        "body_system": "Cardiovascular" | "Pulmonary" | "Neurology" | "Endocrine" | "Infectious Disease" | "Gastrointestinal" | "Renal" | "Psychiatry" | "Hematology" | "Musculoskeletal",
        "mechanism_of_action": "string",
        "indications": "string",
        "routes": "string",
        "pediatric_dosage": "string",
        "adverse_effects": "string",
        "contraindications": "string",
        "patient_counseling": "string",
        "clinical_pearls": "string"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      const textResponse = response.text;
      if (!textResponse) throw new Error('No response from AI');

      let cleanJson = textResponse.trim();
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }

      const parsedData = JSON.parse(cleanJson);

      setFormData(prev => ({
        ...prev,
        ...parsedData,
      }));
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to parse AI response. Please try clicking Auto-Fill again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('medications').insert([formData]);

    setLoading(false);
    if (error) {
      alert('Error saving medication: ' + error.message);
    } else {
      setSuccess(true);
      setFormData({
        generic_name: '',
        brand_names: '',
        drug_class: '',
        body_system: 'Cardiovascular',
        folder: 'Pharmacology I',
        mechanism_of_action: '',
        indications: '',
        routes: '',
        pediatric_dosage: '',
        adverse_effects: '',
        contraindications: '',
        patient_counseling: '',
        clinical_pearls: '',
      });
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-slate-200">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-blue-600" /> Add New Medication
              </h1>
              <p className="text-sm text-slate-500 mt-1">Type a generic or brand name and press Enter or click Auto-Fill.</p>
            </div>
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading ? 'Thinking...' : 'Auto-Fill with AI'}
            </button>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Medication successfully saved to database!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Generic or Brand Name (Press Enter to Auto-Fill)
              </label>
              <input
                type="text"
                name="generic_name"
                value={formData.generic_name}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAIGenerate();
                  }
                }}
                required
                placeholder="e.g., Lisinopril or Zestril"
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
                  placeholder="e.g., Pharmacology I, Cardiology Unit"
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
                  placeholder="e.g., ACE Inhibitors"
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
                  placeholder="e.g., Prinivil, Zestril"
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
                placeholder="Detailed pharmacological mechanism..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Indications (comma-separated)</label>
                <input
                  type="text"
                  name="indications"
                  value={formData.indications}
                  onChange={handleInputChange}
                  placeholder="Hypertension, Heart Failure"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Routes (comma-separated)</label>
                <input
                  type="text"
                  name="routes"
                  value={formData.routes}
                  onChange={handleInputChange}
                  placeholder="Oral, IV"
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
                placeholder="e.g., 0.1 mg/kg/dose PO daily (if applicable)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Adverse Effects (comma-separated)</label>
                <input
                  type="text"
                  name="adverse_effects"
                  value={formData.adverse_effects}
                  onChange={handleInputChange}
                  placeholder="Dry cough, Hyperkalemia"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Contraindications (comma-separated)</label>
                <input
                  type="text"
                  name="contraindications"
                  value={formData.contraindications}
                  onChange={handleInputChange}
                  placeholder="Pregnancy, Angioedema history"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Patient Counseling Tips (comma-separated)</label>
              <textarea
                name="patient_counseling"
                value={formData.patient_counseling}
                onChange={handleInputChange}
                rows={2}
                placeholder="Rise slowly from sitting positions"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Clinical Pearls (Optional)</label>
              <textarea
                name="clinical_pearls"
                value={formData.clinical_pearls}
                onChange={handleInputChange}
                rows={2}
                placeholder="High-yield board note..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? 'Saving Medication...' : 'Save Medication'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}