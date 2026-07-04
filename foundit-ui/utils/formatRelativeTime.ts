export function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (diffMs < 0) {
    return 'just now';
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-CA');
}
