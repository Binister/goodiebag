export function useWakeLock() {
  let sentinel = null
  const supported = 'wakeLock' in navigator

  async function request() {
    if (!supported) return
    try {
      sentinel = await navigator.wakeLock.request('screen')
    } catch {
      // unsupported or denied - silent fallback, no-op
    }
  }

  function handleVisibility() {
    if (document.visibilityState === 'visible' && sentinel !== null) {
      request()
    }
  }

  document.addEventListener('visibilitychange', handleVisibility)

  return { request, supported }
}
