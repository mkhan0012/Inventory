import React from 'react';
import { Plus } from 'lucide-react';
import './QuickActions.css';

const actions = [
  { id: 1, label: 'Add Sale (New Bill)', color: 'var(--primary)', bg: 'rgba(41,98,255,0.1)' },
  { id: 2, label: 'Add Purchase', color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
  { id: 3, label: 'Add New Item', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { id: 4, label: 'Add New Customer', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
];

export default function QuickActions() {
  return (
    <div className="quick-actions-list">
      {actions.map(action => (
        <button key={action.id} className="qa-btn" style={{ backgroundColor: action.color, color: 'white' }}>
          <Plus size={16} />
          {action.label}
        </button>
      ))}
    </div>
  );
}
