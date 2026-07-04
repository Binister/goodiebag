function multiTapHandler(requiredTaps, callback, windowMs = 600) {
  let taps = 0
  let timer = null
  return () => {
    taps++
    if (timer) clearTimeout(timer)
    if (taps >= requiredTaps) {
      taps = 0
      callback()
      return
    }
    timer = setTimeout(() => {
      taps = 0
    }, windowMs)
  }
}

function longPressHandlers(callback, ms = 3000) {
  let timer = null
  return {
    start: () => {
      timer = setTimeout(() => {
        timer = null
        callback()
      }, ms)
    },
    cancel: () => {
      if (timer) clearTimeout(timer)
      timer = null
    }
  }
}

export function useParentControls({ onNext, onPrev, onReset }) {
  const nextTap = multiTapHandler(3, () => onNext?.())
  const prevTap = multiTapHandler(3, () => onPrev?.())
  const resetPress = longPressHandlers(() => onReset?.())

  return { nextTap, prevTap, resetPress }
}
