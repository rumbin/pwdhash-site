import { describe, it, expect, beforeEach } from 'vitest'
import { loadLegacy, loadExtended, mountForm } from './helpers/loadLegacy.js'

describe('algorithm mode switch', () => {
  beforeEach(() => {
    loadLegacy()
    loadExtended()
    mountForm({ domain: 'example.com', sitePassword: 'test' })
  })

  it('defaults to v1 and produces the classic hash', () => {
    expect(getAlgorithm()).toBe('v1')
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
  })

  it('v2 mode produces the extended hash', () => {
    setAlgorithm('v2')
    expect(getAlgorithm()).toBe('v2')
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('Uay)PZm%#3}v')
  })

  it('switching back to v1 restores the classic hash', () => {
    setAlgorithm('v2')
    window.GenerateToTextField()
    setAlgorithm('v1')
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
  })

  it('reflects the mode in the badge and checkbox', () => {
    const badge = document.getElementById('algoBadge')
    expect(badge.textContent).toBe('v1')
    setAlgorithm('v2')
    expect(badge.textContent).toBe('v2')
    expect(document.getElementById('algoSwitch').checked).toBe(true)
    setAlgorithm('v1')
    expect(badge.textContent).toBe('v1')
    expect(document.getElementById('algoSwitch').checked).toBe(false)
  })

  it('applies the case-insensitive switch in v2 mode too', () => {
    setAlgorithm('v2')
    mountForm({ domain: 'Example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('Uay)PZm%#3}v') // lowercased realm
    setCaseInsensitive(false)
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).not.toBe('Uay)PZm%#3}v') // mixed-case realm
  })
})
