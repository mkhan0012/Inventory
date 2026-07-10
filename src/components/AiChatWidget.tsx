"use client";
import React, { useState } from 'react';
import { Bot, Send, Sparkles, FileText } from 'lucide-react';
import { askAI, generateCEOBriefing } from '@/actions/ai';

export default function AiChatWidget() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      const res = await askAI(query);
      setResponse(res);
    } catch (err) {
      setResponse("An error occurred while fetching the answer.");
    }
    setLoading(false);
  };

  const handleGenerateBriefing = async () => {
    setLoading(true);
    setResponse('Gathering data and writing CEO Briefing. This may take a moment...');
    try {
      const res = await generateCEOBriefing();
      setResponse(res);
    } catch (err) {
      setResponse("Failed to generate CEO Briefing.");
    }
    setLoading(false);
  };

  const presetQueries = [
    "Who are my top customers?",
    "Which items are low on stock?",
    "Who owes me the most money?",
    "What were the total sales last 30 days?"
  ];

  return (
    <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(41,98,255,0.05) 0%, rgba(16,185,129,0.05) 100%)', border: '1px solid rgba(41,98,255,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Bharat AI Assistant <Sparkles size={16} color="#f59e0b" />
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Ask questions or give commands (e.g., "Log a 500 expense for Tea")</div>
          </div>
        </div>
        <button 
          onClick={handleGenerateBriefing} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          <FileText size={16} /> {loading ? 'Writing...' : 'Generate CEO Briefing'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {presetQueries.map((q, idx) => (
          <button 
            key={idx}
            onClick={() => { setQuery(q); }}
            style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer' }}
          >
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={handleAsk} style={{ display: 'flex', gap: '12px' }}>
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. Which customers have unpaid dues?"
          style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
        />
        <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
          {loading ? 'Thinking...' : <><Send size={16} /> Ask AI</>}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-main)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
          {response}
        </div>
      )}
    </div>
  );
}
