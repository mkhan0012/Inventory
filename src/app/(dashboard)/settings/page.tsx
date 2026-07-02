import React from 'react';
import { Save, Download } from 'lucide-react';
import '../inventory/page.css';
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
      notes: formData.get('notes') as string
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-main)' }}>Shop Details</h2>
        <form action={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Shop Name</label>
            <input name="shopName" defaultValue={settings.shopName} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Shop Address</label>
            <textarea name="address" defaultValue={settings.address} rows={3} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>GST Number</label>
            <input name="gstNumber" defaultValue={settings.gstNumber} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Default Tax Rate (%)</label>
            <input name="defaultTax" type="number" step="0.1" defaultValue={settings.defaultTax} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn-primary">
              <Save size={16} /> Save Settings
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: '600px', padding: '24px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-main)' }}>Database Management</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Download a complete snapshot of your PostgreSQL database (pg_dump) for manual backups and safe-keeping.
        </p>
        <a href="/api/backup" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Download size={16} /> Download Backup (.sql)
        </a>
      </div>

      <div className="card" style={{ maxWidth: '600px', padding: '24px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-main)' }}>Historical Data Entry</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Add bulk sales and profit data from the past to populate your all-time metrics and charts.
        </p>
        
        <form action={handleAddHistorical} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Date</label>
              <input type="date" name="date" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Total Sales (₹)</label>
              <input type="number" step="0.01" name="sales" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Total Profit (₹)</label>
              <input type="number" step="0.01" name="profit" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Notes (Optional)</label>
            <input type="text" name="notes" placeholder="e.g. Q1 2023 Bulk Import" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" style={{ background: '#f59e0b', color: 'white', border: 'none' }}>
              <Save size={16} /> Add Past Record
            </button>
          </div>
        </form>

        <h3 style={{ fontSize: '15px', marginBottom: '12px', color: 'var(--text-main)' }}>Past Records</h3>
        {historicalRecords.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No historical records found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {historicalRecords.map(rec => (
              <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>
                    {new Date(rec.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Sales: ₹{rec.sales.toLocaleString('en-IN')} | Profit: ₹{rec.profit.toLocaleString('en-IN')} {rec.notes && `| ${rec.notes}`}
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
  );
}
