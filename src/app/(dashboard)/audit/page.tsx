import React from 'react';
import { getAuditLogs } from '@/actions/activity';
import { ShieldAlert, Clock, User } from 'lucide-react';
import '../inventory/page.css';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={28} color="#ef4444" />
          <h1 className="page-title">Audit Logs</h1>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>Secure Owner-only Activity Feed</div>
      </div>

      <div className="card table-container" style={{ marginTop: '24px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No activities logged yet.</td>
              </tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="font-medium">
                  <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {log.userName}
                </td>
                <td>
                  <span className="status-badge" style={{ background: log.userRole === 'OWNER' ? 'rgba(41,98,255,0.1)' : 'rgba(245,158,11,0.1)', color: log.userRole === 'OWNER' ? '#2962ff' : '#f59e0b' }}>
                    {log.userRole}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold' }}>{log.action}</td>
                <td style={{ color: 'var(--text-muted)' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
