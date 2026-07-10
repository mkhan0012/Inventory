"use client";
import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, MessageSquare, FileText } from 'lucide-react';
import { askAI, generateCEOBriefing } from '@/actions/ai';
import './FloatingAiWidget.css';

export default function FloatingAiWidget() {
  const [isOpen, setIsOpen] = useState(false);
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
    "What is my all-time total profit?"
  ];

  return (
    <>
      <button 
        className={`fab-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Bharat AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <div className={`ai-drawer ${isOpen ? 'open' : ''}`}>
        <div className="ai-drawer-header">
          <div className="ai-header-title">
            <div className="ai-bot-icon">
              <Bot size={20} />
            </div>
            <div>
              <h3>Bharat AI <Sparkles size={14} color="#f59e0b" /></h3>
              <p>Business Assistant</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="close-btn"><X size={20}/></button>
        </div>

        <div className="ai-drawer-content">
          {!response && !loading && (
            <div className="preset-container">
              <p className="preset-hint">Try asking:</p>
              {presetQueries.map((q, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setQuery(q); handleAsk(); }}
                  className="preset-btn"
                >
                  {q}
                </button>
              ))}
              
              <button 
                onClick={handleGenerateBriefing}
                style={{ marginTop: '12px', width: '100%', padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <FileText size={16} /> Generate CEO Briefing
              </button>
            </div>
          )}

          {loading && (
            <div className="ai-loading">
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
            </div>
          )}

          {response && (
            <div className="ai-response" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '13px' }}>
              {response}
            </div>
          )}
        </div>

        <form onSubmit={handleAsk} className="ai-drawer-footer">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask a question..."
          />
          <button type="submit" disabled={loading || !query.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
