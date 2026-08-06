import { getDefaultStore } from 'jotai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { activeHashIdAtom } from '../sharedSettingsState'
import { scrollToHashTarget } from './useScrollToHash'

const observers: Array<{ disconnect: ReturnType<typeof vi.fn> }> = []
let originalScrollIntoView: typeof Element.prototype.scrollIntoView

beforeEach(() => {
  observers.length = 0
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal(
    'ResizeObserver',
    class FakeResizeObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      constructor() {
        observers.push(this)
      }
    },
  )
  originalScrollIntoView = Element.prototype.scrollIntoView
  Element.prototype.scrollIntoView = vi.fn()
  document.body.innerHTML = '<div id="one"></div><div id="two"></div>'
  window.history.replaceState(undefined, '', '#')
})

afterEach(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView
  // cSpell:ignore unstub
  vi.unstubAllGlobals()
  vi.clearAllTimers()
  vi.clearAllMocks()
  observers.length = 0
})

describe('scrollToHashTarget', () => {
  // Every caller is a click handler that discards the returned stop(), so a
  // superseded invocation can only be torn down from inside the module. The
  // wheel/pointerdown/keydown listeners happen to cover clicks, but not two
  // calls made back to back without an interaction between them.
  it('cancels the in-flight scroll when a new target supersedes it', () => {
    scrollToHashTarget('one', { smooth: true })
    const first = observers[0]
    expect(first.disconnect).not.toHaveBeenCalled()

    scrollToHashTarget('two', { smooth: true })
    expect(first.disconnect).toHaveBeenCalled()
  })

  it('leaves an in-flight scroll alone when the new target is not in the DOM', () => {
    scrollToHashTarget('one', { smooth: true })
    const first = observers[0]

    scrollToHashTarget('never-rendered', { smooth: true })
    expect(first.disconnect).not.toHaveBeenCalled()
  })

  it('publishes the target to activeHashIdAtom and the URL', () => {
    scrollToHashTarget('two', { smooth: false })

    expect(getDefaultStore().get(activeHashIdAtom)).toBe('two')
    expect(window.location.hash).toBe('#two')
  })
})

describe('activeHashIdAtom', () => {
  // replaceState (what scrollToHashTarget uses) does not fire hashchange, so
  // this path only covers hash changes the app did not make: a manually edited
  // URL, back/forward across hash entries, and plain <a href="#..."> links.
  it('resyncs when the hash changes outside the app', () => {
    const store = getDefaultStore()
    scrollToHashTarget('one', { smooth: false })
    expect(store.get(activeHashIdAtom)).toBe('one')

    window.history.replaceState(undefined, '', '#two')
    window.dispatchEvent(new Event('hashchange'))

    expect(store.get(activeHashIdAtom)).toBe('two')
  })
})
