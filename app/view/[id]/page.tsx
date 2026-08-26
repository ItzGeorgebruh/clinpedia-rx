'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Stethoscope, AlertTriangle, ShieldAlert, Baby } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Medication {
  generic_name: string;
  brand_names: string;
  drug_class: string;
  body_system: string;
  mechanism_of_action: string;
  indications: string;
  routes: string;
  pediatric_dosage: string;
  adverse_effects: string;
  contraindications: string;
  patient_counseling: string;
  clinical_pearls: string;
}

export default function ViewMedicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [med, setMed] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);

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
    } else {
      setMed(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading clinical data...</div>;
  }

  if (!med) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Medication not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>
          
          <Link
            href={`/edit/${id}`}
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <Edit3 className="w-4 h-4" /> Edit Medication
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-2xl p-6 md:p-8 border border-slate-200 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                {med.body_system}
              </span>
              <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                {med.drug_class || 'General'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">{med.generic_name}</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              <span className="text-slate-700">Brand Names:</span> {med.brand_names || 'None listed'}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <Stethoscope className="w-4 h-4 text-indigo-600" /> Mechanism of Action (MOA)
              </h3>
              <p className="text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                {med.mechanism_of_action || 'Not specified'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-slate-700 mb-1">Indications</h3>
                <p className="text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {med.indications || 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-1">Routes</h3>
                <p className="text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {med.routes || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Pediatric Dosage Highlight Box */}
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
              <h3 className="text-xs font-bold text-indigo-700 uppercase flex items-center gap-1.5 mb-1">
                <Baby className="w-4 h-4 text-indigo-600" /> Pediatric Dosage
              </h3>
              <p className="text-sm text-slate-700 font-medium">{med.pediatric_dosage || 'Not specified / Adult only'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-xl">
                <h3 className="text-xs font-bold text-rose-700 uppercase flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-4 h-4" /> Adverse Effects
                </h3>
                <p className="text-xs text-slate-700">{med.adverse_effects || 'None listed'}</p>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-xl">
                <h3 className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1 mb-1">
                  <ShieldAlert className="w-4 h-4" /> Contraindications
                </h3>
                <p className="text-xs text-slate-700">{med.contraindications || 'None listed'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-700 mb-1">Patient Counseling Tips</h3>
              <p className="text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {med.patient_counseling || 'None specified'}
              </p>
            </div>

            {med.clinical_pearls && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900">
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-800 mb-1">Clinical Pearl</h3>
                <p className="text-sm">{med.clinical_pearls}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}