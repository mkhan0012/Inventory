import React from 'react';
import { AlertTriangle, XOctagon, Clock } from 'lucide-react';
import './StockAlerts.css';

const alerts = [
  { id: 1, title: 'Low Stock', count: 8, subtitle: 'Items running low', icon: <AlertTriangle size={20} color="#f59e0b" />, bg: 'rgba(245,158,11,0.1)' },
  { id: 2, title: 'Out of Stock', count: 3, subtitle: 'Items out of stock', icon: <XOctagon size={20} color="#ef4444" />, bg: 'rgba(239,68,68,0.1)' },
  { id: 3, title: 'Expiring Stock', count: 2, subtitle: 'Items expiring soon', icon: <Clock size={20} color="#2962ff" />, bg: 'rgba(41,98,255,0.1)' },
];

export default function StockAlerts() {
  return (
    <div className="stock-alerts-list">
      {alerts.map(alert => (
        <div key={alert.id} className="sa-item">
          <div className="sa-icon-wrapper" style={{ backgroundColor: alert.bg }}>
            {alert.icon}
          </div>
          <div className="sa-info">
            <p className="sa-title">{alert.title} <span>({alert.count})</span></p>
            <p className="sa-subtitle">{alert.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
