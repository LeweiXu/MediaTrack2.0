export const STATUSES = ['current', 'planned', 'completed', 'on_hold', 'dropped'];

export const MEDIUMS = [
  'Film', 'TV Show', 'Anime', 'Book', 'Manga',
  'Light Novel', 'Web Novel', 'Comics', 'Game',
];

export const ORIGINS = ['Japanese', 'Korean', 'Chinese', 'Western', 'Other'];

export const STATUS_LABELS = {
  current:   'Current',
  planned:   'Planned',
  completed: 'Completed',
  on_hold:   'On Hold',
  dropped:   'Dropped',
};

export const statusLabel   = (s) => STATUS_LABELS[s] ?? s;
export const badgeClass    = (s) => `badge badge-${s}`;

export const logDotClass = (status) => ({
  current:   'log-dot blue',
  planned:   'log-dot purple',
  completed: 'log-dot',
  on_hold:   'log-dot amber',
  dropped:   'log-dot red',
}[status] ?? 'log-dot');

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs  = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5)  return `${weeks}w ago`;
  return fmtDate(iso);
}

export function progressPercent(entry) {
  if (!entry) return 0;
  const { progress, total } = entry;
  if (!total) return 0;
  return Math.min(100, Math.round((progress / total) * 100));
}

export function progressLabel(entry) {
  if (!entry) return '—';
  const { progress, total, medium } = entry;
  if (!progress && !total) return '—';
  const isBook = medium?.toLowerCase().includes('book') || medium?.toLowerCase().includes('novel');
  const unit = isBook ? 'p.' : 'ep.';
  if (total) return `${progress ?? '?'} / ${total} ${unit}`;
  return `${progress} ${unit}`;
}

/** Normalise the varied shapes the backend might return for a list response */
export function extractItems(data) {
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.entries ?? data?.results ?? [];
}
