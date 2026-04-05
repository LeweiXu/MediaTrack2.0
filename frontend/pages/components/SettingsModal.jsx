import { useState } from 'react';
import { changePassword } from '../../api.jsx';

export default function SettingsModal({ onClose }) {
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  const [backupFreq, setBackupFreq] = useState('never');

  async function handleChangePassword(e) {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (newPw !== confirmPw) { setError('New passwords do not match.'); return; }
    setSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setSuccess(true);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal settings-modal">
        <div className="modal-header">
          <span className="modal-title">Settings</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="settings-section-label">Change Password</p>
          <form onSubmit={handleChangePassword}>
            <div className="form-row">
              <label className="form-label">Current password</label>
              <input className="form-input" type="password" autoComplete="current-password"
                value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
            </div>
            <div className="form-row">
              <label className="form-label">New password</label>
              <input className="form-input" type="password" autoComplete="new-password"
                value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} />
            </div>
            <div className="form-row">
              <label className="form-label">Confirm new password</label>
              <input className="form-input" type="password" autoComplete="new-password"
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required minLength={6} />
            </div>
            {error   && <div className="settings-msg settings-msg-error">{error}</div>}
            {success && <div className="settings-msg settings-msg-success">Password changed.</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button className="btn" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Update Password'}
              </button>
            </div>
          </form>

          <div className="settings-divider" />

          <p className="settings-section-label">Periodic Backup</p>
          <div className="form-row">
            <label className="form-label">Backup frequency</label>
            <select className="form-input" value={backupFreq}
              onChange={e => setBackupFreq(e.target.value)}>
              <option value="never">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div style={{ fontSize: 11, color: 'var(--dim)' }}>
            Automatic backup scheduling coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}
