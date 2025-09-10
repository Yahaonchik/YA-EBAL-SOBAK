import { useEffect } from 'react'

export default function useInView({ selector = '.slide-from-left, .slide-from-right', root = null, rootMargin = '0px 0px -40% 0px', threshold = 0, delayPx = 10, delayMs = 0 } = {}) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const targets = Array.from(document.querySelectorAll(selector))
    if (!targets || targets.length === 0) return

    if (!('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('in-view'))
      return
    }

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target
        try {
          const isFeatureBlock = el.closest && el.closest('.frame1196-container162')
          el.style.willChange = 'transform, opacity'

          const start = () => {
            requestAnimationFrame(() => requestAnimationFrame(() => {
              try { el.classList.add('in-view') } catch (e) {}
            }))
            const onEnd = (ev) => {
              if (ev.propertyName === 'transform' || ev.propertyName === 'opacity') {
                el.style.willChange = 'auto'
                el.removeEventListener('transitionend', onEnd)
              }
            }
            el.addEventListener('transitionend', onEnd)
            try { observer.unobserve(el) } catch (e) {}
          }

          if (isFeatureBlock && delayPx > 0) {
            const targetY = window.innerHeight * 0.6 + delayPx
            let rafId = null
            const poll = () => {
              if (!document.body.contains(el)) return
              const rect = el.getBoundingClientRect()
              if (rect.top <= targetY) {
                start()
                if (rafId) cancelAnimationFrame(rafId)
                return
              }
              if (rect.top > window.innerHeight) return
              rafId = requestAnimationFrame(poll)
            }
            poll()
          } else if (isFeatureBlock && delayMs > 0) {
            setTimeout(start, delayMs)
          } else {
            start()
          }
        } catch (e) {
          try { el.classList.add('in-view') } catch (err) {}
          try { obs.unobserve(el) } catch (err) {}
        }
      })
    }, { root, rootMargin, threshold })

    targets.forEach(t => obs.observe(t))
    return () => obs.disconnect()
  }, [selector, root, rootMargin, threshold, delayPx, delayMs])
}
