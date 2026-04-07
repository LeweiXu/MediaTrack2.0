import { useState } from 'react';
import { updateEntry, deleteEntry } from '../../api.jsx';
import { MEDIUMS, STATUSES, statusLabel, inferSourceFromUrl } from '../../utils.jsx';

export default function EditEntryModal({ entry, onClose, onUpdated, onDeleted }) {
  const [form, setForm] = useState({
    title:        entry.title        || '',
    medium:       entry.medium       || '',
    origin:       entry.origin       || '',
    status:       entry.status       || 'planned',
    year:         entry.year         || '',
    rating:       entry.rating       ?? '',
    progress:     entry.progress     ?? '',
    total:        entry.total        ?? '',
    cover_url:    entry.cover_url    || '',
    notes:        entry.notes        || '',
    external_url: entry.external_url || '',
    source:       entry.source       || '',
  });

  const [saving,         setSaving]         = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [err,            setErr]            = useState('');
  const [confirmDelete,  setConfirmDelete]  = useState(false);

  const setField = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === 'external_url') next.source = inferSourceFromUrl(v);
    return next;
  });

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const payload = {
        ...form,
        year:     form.year     !== '' ? parseInt(form.year)     : undefined,
        rating:   form.rating   !== '' ? parseFloat(form.rating) : undefined,
        progress: form.progress !== '' ? parseInt(form.progress) : undefined,
        total:    form.total    !== '' ? parseInt(form.total)    : undefined,
      };
      const updated = await updateEntry(entry.id, payload);
      onUpdated(updated);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true); setErr('');
    try {
      await deleteEntry(entry.id);
      onDeleted(entry.id);
      onClose();
    } catch (e) {
      setErr(e.message);
      setDeleting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Edit — {entry.title}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSave}>
            <div className="form-row">
              <label className="form-label">Title</label>
              <input className="form-input" value={form.title}
                onChange={e => setField('title', e.target.value)} />
            </div>

            <div className="form-row-2" style={{ marginBottom: 14 }}>
              <div>
                <label className="form-label">Medium</label>
                <select className="form-input" value={form.medium} onChange={e => setField('medium', e.target.value)}>
                  <option value="">—</option>
                  {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setField('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row-2" style={{ marginBottom: 14 }}>
              <div>
                <label className="form-label">Origin</label>
                <input className="form-input" value={form.origin}
                  onChange={e => setField('origin', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Year</label>
                <input className="form-input" type="number" value={form.year}
                  onChange={e => setField('year', e.target.value)} />
              </div>
            </div>

            <div className="form-row-2" style={{ marginBottom: 14 }}>
              <div>
                <label className="form-label">Progress</label>
                <input className="form-input" type="number" value={form.progress}
                  onChange={e => setField('progress', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Total</label>
                <input className="form-input" type="number" value={form.total}
                  onChange={e => setField('total', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Rating (0–10)</label>
              <input className="form-input" type="number" min="0" max="10" step="0.1"
                value={form.rating} onChange={e => setField('rating', e.target.value)} />
            </div>

            <div className="form-row">
              <label className="form-label">Cover URL</label>
              <input className="form-input" value={form.cover_url}
                onChange={e => setField('cover_url', e.target.value)} />
            </div>

            <div className="form-row">
              <label className="form-label">Source URL</label>
              <input className="form-input" value={form.external_url} placeholder="https://novelupdates.com/series/…"
                onChange={e => setField('external_url', e.target.value)} />
              {form.source && (
                <span style={{ fontSize: 11, color: 'var(--accent)', marginTop: 3 }}>
                  Source: {form.source}
                </span>
              )}
            </div>

            <div className="form-row">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={form.notes}
                onChange={e => setField('notes', e.target.value)} style={{ resize: 'vertical' }} />
            </div>

            {err && <div style={{ color: 'var(--red)', fontSize: 11, marginBottom: 8 }}>{err}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 4 }}>
              <div>
                {!confirmDelete
                  ? <button type="button" className="icon-btn danger" onClick={() => setConfirmDelete(true)}>
                      Delete
                    </button>
                  : <span style={{ fontSize: 11, color: 'var(--red)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      Confirm?
                      <button type="button" className="btn btn-danger"
                        style={{ padding: '3px 10px', fontSize: 11 }}
                        onClick={handleDelete} disabled={deleting}>
                        {deleting ? '…' : 'Yes, delete'}
                      </button>
                      <button type="button" className="icon-btn" onClick={() => setConfirmDelete(false)}>No</button>
                    </span>
                }
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
