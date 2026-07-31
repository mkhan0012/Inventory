"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, AlertCircle, Plus, RefreshCw, BarChart, FileText } from 'lucide-react';
import { askAI, generateCEOBriefing } from '@/actions/ai';
import './page.css';

export default function AiCommandCenter() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Hello! I am Bharat Super AI. I'm connected to your live database. Ask me to create products, update stock, generate reports, or analyze profitability." }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAsk = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const textToSubmit = presetQuery || query;
    if (!textToSubmit.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: textToSubmit }]);
    setQuery('');
    setLoading(true);
    
    try {
      const res = await askAI(textToSubmit);
      setMessages(prev => [...prev, { role: 'ai', content: res }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "An error occurred while fetching the answer." }]);
    }
    setLoading(false);
  };

  const handleGenerateBriefing = async () => {
    setMessages(prev => [...prev, { role: 'user', content: 'Generate CEO Briefing' }]);
    setLoading(true);
    try {
      const res = await generateCEOBriefing();
      setMessages(prev => [...prev, { role: 'ai', content: res }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Failed to generate CEO Briefing." }]);
    }
    setLoading(false);
  };

  const suggestions = [
    { text: "Add a new product", icon: <Plus size={16} />, query: "I need to add a new product." },
    { text: "Update stock levels", icon: <RefreshCw size={16} />, query: "I want to update the stock for a product." },
    { text: "Profitability Report", icon: <BarChart size={16} />, query: "Give me an analysis of our all-time profitability." },
    { text: "Low stock items", icon: <AlertCircle size={16} />, query: "Which items are running low on stock and need restocking?" },
  ];

  return (
    <div className="ai-page-container">
      <div className="ai-header">
        <div className="ai-title-group">
          <div className="ai-bot-avatar">
            <Bot size={28} />
          </div>
          <div>
            <h1>Bharat Super AI <Sparkles size={18} className="sparkle-icon" /></h1>
            <p>Your intelligent business command center.</p>
          </div>
        </div>
        <button className="ceo-btn" onClick={handleGenerateBriefing} disabled={loading}>
          <FileText size={18} /> CEO Briefing
        </button>
      </div>

      <div className="ai-chat-area">
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              {msg.role === 'ai' && (
                <div className="message-avatar ai">
                  <Bot size={18} />
                </div>
              )}
              <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="message-avatar user">
                  U
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="message-wrapper ai">
              <div className="message-avatar ai">
                <Bot size={18} />
              </div>
              <div className="message-bubble loading-bubble">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="ai-input-area">
        <div className="suggestions-row">
          {suggestions.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => handleAsk(undefined, s.query)} disabled={loading}>
              {s.icon} {s.text}
            </button>
          ))}
        </div>
        <form onSubmit={e => handleAsk(e)} className="input-form">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask AI to add products, update stock, or analyze your data..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !query.trim()} className="send-btn">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
