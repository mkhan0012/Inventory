import React from 'react';
import { Save, Download } from 'lucide-react';
import '../inventory/page.css';
import { getSettings, updateSettings } from '@/actions/settings';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();

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
          Download a complete snapshot of your SQLite database for manual backups and safe-keeping.
        </p>
        <a href="/api/backup" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Download size={16} /> Download Backup (.db)
        </a>
      </div>
    </div>
  );
}
