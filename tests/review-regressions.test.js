import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadLegacy, loadExtended, mountForm } from './helpers/loadLegacy.js'

// Regressions found in the 2026-10-11 project review (B1, B2, B4 + a11y).
describe('review regressions', () => {
  beforeEach(() => {
    loadLegacy()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('B1: v1 and v2 strip @@ exactly once and agree at the form level', () => {
    loadExtended()
    mountForm({ domain: 'example.com', sitePassword: '@@@@test' })
    setAlgorithm('v1')
    window.GenerateToTextField()
    const v1 = document.hashform.hashedPassword.value
    setAlgorithm('v2')
    window.GenerateToTextField()
    const v2 = document.hashform.hashedPassword.value
    // both modes hash '@@test' (one strip), never 'test' (two strips)
    expect(v1).toBe(String(new SPH_HashedPassword('@@test', 'example.com')))
    expect(v2).toBe(SPH_ExtendedHashedPassword('@@test', 'example.com'))
    // and '@@test' input strips to 'test' in both modes
    mountForm({ domain: 'example.com', sitePassword: '@@test' })
    setAlgorithm('v1')
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value)
      .toBe(String(new SPH_HashedPassword('test', 'example.com')))
    setAlgorithm('v2')
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value)
      .toBe(SPH_ExtendedHashedPassword('test', 'example.com'))
  })

  it('B2: empty site address never throws and clears the stale hash', () => {
    mountForm({})
    window.Init()
    typeValue(document.hashform.domain, 'example.com')
    typeValue(document.hashform.sitePassword, 'test')
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')

    typeValue(document.hashform.domain, '')
    expect(document.hashform.hashedPassword.value).toBe('') // stale hash gone

    // never throws, even called directly
    expect(() => window.GenerateToTextField()).not.toThrow()
    expect(document.hashform.hashedPassword.value).toBe('')
  })

  it('B2: whitespace-only site address is treated as empty', () => {
    mountForm({})
    window.Init()
    typeValue(document.hashform.domain, '   ')
    typeValue(document.hashform.sitePassword, 'test')
    expect(document.hashform.hashedPassword.value).toBe('')
  })

  it('B4: rejected clipboard write falls back to execCommand', async () => {
    vi.useFakeTimers()
    mountForm({ domain: 'example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    })
    let copied = null
    document.execCommand = (cmd) => { copied = cmd; return true }
    await window.copyHashedPassword()
    expect(copied).toBe('copy')
    const btn = document.getElementById('copyBtn')
    expect(btn.querySelector('.btn-label').textContent).toBe('Copied!')
    vi.advanceTimersByTime(1500)
    expect(btn.querySelector('.btn-label').textContent).toBe('Copy')
  })

  it('B4: shows "Copy failed" when every mechanism fails', async () => {
    vi.useFakeTimers()
    mountForm({ domain: 'example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    })
    document.execCommand = () => false
    await window.copyHashedPassword()
    const btn = document.getElementById('copyBtn')
    expect(btn.querySelector('.btn-label').textContent).toBe('Copy failed')
    vi.advanceTimersByTime(1500)
    expect(btn.querySelector('.btn-label').textContent).toBe('Copy')
  })

  it('a11y: eye button title tracks its state like aria-label', () => {
    mountForm({ domain: 'example.com', sitePassword: 'test' })
    const btn = document.getElementById('revealBtn')
    expect(btn.title).toBe('Reveal password')
    window.toggleReveal()
    expect(btn.title).toBe('Hide password')
    expect(btn.getAttribute('aria-label')).toBe('Hide password')
    window.toggleReveal()
    expect(btn.title).toBe('Reveal password')
  })
})

function typeValue(el, value) {
  el.value = value
  el.dispatchEvent(new window.Event('input'))
}
