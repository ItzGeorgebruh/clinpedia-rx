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
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const textResponse = response.text;
      if (!textResponse) throw new Error('No response from AI');

      const cleanJson = textResponse.replace(/```json/g, '').replace(/