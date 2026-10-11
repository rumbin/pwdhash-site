import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadLegacy, mountForm } from './helpers/loadLegacy.js'

describe('hashed password output controls', () => {
  beforeEach(() => {
    loadLegacy()
    mountForm({ domain: 'example.com', sitePassword: 'test' })
    window.GenerateToTextField()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('masks the output by default', () => {
    const field = document.hashform.hashedPassword
    expect(isRevealed()).toBe(false)
    expect(field.type).toBe('password')
    expect(field.value).toBe('MeJ8G9') // value is there, just masked
  })

  it('reveals on eye click and re-masks on second click', () => {
    const field = document.hashform.hashedPassword
    toggleReveal()
    expect(isRevealed()).toBe(true)
    expect(field.type).toBe('text')
    toggleReveal()
    expect(isRevealed()).toBe(false)
    expect(field.type).toBe('password')
  })

  it('copies the hashed password even while masked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText }, configurable: true,
    })
    await copyHashedPassword()
    expect(writeText).toHaveBeenCalledWith('MeJ8G9')
  })

  it('shows copy feedback and restores the label', async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true,
    })
    const btn = document.getElementById('copyBtn')
    await copyHashedPassword()
    expect(btn.textContent).toBe('Copied!')
    vi.advanceTimersByTime(1500)
    expect(btn.textContent).toBe('Copy')
  })

  it('Init shows the hint as placeholder so it stays readable while masked', () => {
    mountForm({})
    window.Init()
    const field = document.hashform.hashedPassword
    expect(field.value).toBe('')
    expect(field.placeholder).toBe('Press Generate')
  })
})
