"use client";
import React, { useEffect, useState } from 'react';
import { generateDailyInsight } from '@/actions/ai';
import { Sparkles } from 'lucide-react';

export default function AiInsightBanner() {
  const [insight, setInsight] = useState("Analyzing today's performance...");
  
  useEffect(() => {
    generateDailyInsight().then(res => setInsight(res));
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(41,98,255,0.08), rgba(139,92,246,0.12))',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
      animation: 'fadeInUp 0.5s ease-out'
    }}>
      <Sparkles size={20} color="#8b5cf6" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)', lineHeight: '1.5' }}>
        {insight}
      </span>
    </div>
  );
}
