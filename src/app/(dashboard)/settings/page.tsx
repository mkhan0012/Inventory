import React from 'react';
import { Save, Download, Store, Database, History, Receipt, Trash2 } from 'lucide-react';
import './page.css';
import { getSettings, updateSettings } from '@/actions/settings';
import { getHistoricalRecords, addHistoricalRecord, deleteHistoricalRecord } from '@/actions/historical';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();
  const historicalRecords = await getHistoricalRecords();

  const handleSave = async (formData: FormData) => {
    "use server";
    await updateSettings({
      shopName: formData.get('shopName') as string,
      address: formData.get('address') as string,
      gstNumber: formData.get('gstNumber') as string,
      defaultTax: parseFloat(formData.get('defaultTax') as string)
    });
    revalidatePath('/settings');
  };

  const handleAddHistorical = async (formData: FormData) => {
    "use server";
    await addHistoricalRecord({
      date: formData.get('date') as string,
      sales: parseFloat(formData.get('sales') as string),
      profit: parseFloat(formData.get('profit') as string),
      purchases: parseFloat(formData.get('purchases') as string),
      notes: formData.get('notes') as string
    });
  };

  return (
    <div className="settings-container animate-fade-in-up">
      <div className="settings-header">
        <h1 className="settings-title">Preferences & Settings</h1>
        <p className="settings-description">Manage your shop details, data backups, and historical records in one place.</p>
      </div>

      <div className="settings-grid">
        
        {/* Shop Details Card */}
        <div className="settings-card stagger-1">
          <div className="card-icon-wrapper">
            <Store size={24} />
          </div>
          <h2 className="settings-card-title">Shop Details</h2>
          <p className="settings-card-desc">Update your business information, which will appear on invoices and reports.</p>
          
          <form action={handleSave}>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input name="shopName" defaultValue={settings.shopName} required className="form-input" placeholder="e.g. Acme Supermarket" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Shop Address</label>
              <textarea name="address" defaultValue={settings.address} rows={3} className="form-input" placeholder="Full address..." style={{ resize: 'vertical' }} />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">GST Number</label>
                <input name="gstNumber" defaultValue={settings.gstNumber} className="form-input" placeholder="Optional" />
              </div>
              <div className="form-group">
                <label className="form-label">Default Tax (%)</label>
                <input name="defaultTax" type="number" step="0.1" defaultValue={settings.defaultTax} required className="form-input" />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="submit" className="btn-primary-custom">
                <Save size={18} /> Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Database Management Card */}
        <div className="settings-card stagger-2">
          <div className="card-icon-wrapper" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
            <Database size={24} />
          </div>
          <h2 className="settings-card-title">Database Backup</h2>
          <p className="settings-card-desc">Download a complete snapshot of your PostgreSQL database (.sql) to keep your data safe manually.</p>
          
          <a href="/api/backup" className="btn-primary-custom" style={{ background: '#8b5cf6', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)' }}>
            <Download size={18} /> Export Database Backup
          </a>
        </div>

        {/* Historical Data Card */}
        <div className="settings-card full-width-card stagger-3">
          <div className="card-icon-wrapper" style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
            <History size={24} />
          </div>
          <h2 className="settings-card-title">Historical Data Entry</h2>
          <p className="settings-card-desc">Add bulk data from the past to populate your analytics charts.</p>
          
          <form action={handleAddHistorical} style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
            <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" name="date" required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Sales (₹)</label>
                <input type="number" step="0.01" name="sales" required className="form-input" placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Profit (₹)</label>
                <input type="number" step="0.01" name="profit" required className="form-input" placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Purchases (₹)</label>
                <input type="number" step="0.01" name="purchases" required className="form-input" placeholder="0.00" />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <input type="text" name="notes" placeholder="e.g. Q1 2023 Bulk Import" className="form-input" />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" className="btn-warning-custom">
                <Save size={18} /> Add Past Record
              </button>
            </div>
          </form>

          <h3 className="settings-card-title" style={{ fontSize: '18px' }}>Past Records</h3>
          {historicalRecords.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border)', marginTop: '16px' }}>
              No historical records found.
            </div>
          ) : (
            <div className="history-list">
              {historicalRecords.map(rec => (
                <div key={rec.id} className="history-item">
                  <div>
                    <div className="history-date">
                      {new Date(rec.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="history-stats">
                      <span className="history-stat-pill text-primary">
                        <Receipt size={14}/> Sales: ₹{rec.sales.toLocaleString('en-IN')}
                      </span>
                      <span className="history-stat-pill text-success">
                        Profit: ₹{rec.profit.toLocaleString('en-IN')}
                      </span>
                      <span className="history-stat-pill text-warning">
                        Purchases: ₹{rec.purchases.toLocaleString('en-IN')}
                      </span>
                      {rec.notes && (
                        <span className="history-stat-pill" style={{ color: 'var(--text-muted)' }}>
                          📝 {rec.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <DeleteButton 
                    id={rec.id}
                    action={deleteHistoricalRecord}
                    itemType="historical record"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
