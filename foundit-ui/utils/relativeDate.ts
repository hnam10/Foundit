export function getRelativeTime(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);

  const diffMs = now.getTime() - past.getTime();

  const minutes = Math.floor(diffMs / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${days}d ago`;
}
