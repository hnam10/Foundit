const AUTH_CHANGED = 'foundit:auth-changed';

export function notifyAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED));
  }
}

/** Recheck storage after same-tab changes, cross-tab changes and history restoration. */
export function subscribeAuth(listener: () => void) {
  const events = [AUTH_CHANGED, 'storage', 'pageshow', 'focus'];
  events.forEach((event) => window.addEventListener(event, listener));
  return () => {
    events.forEach((event) => window.removeEventListener(event, listener));
  };
}
