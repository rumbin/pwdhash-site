import { describe, it, expect, beforeEach } from 'vitest'
import { loadLegacy, loadExtended, mountForm } from './helpers/loadLegacy.js'

describe('strip http(s) switch', () => {
  beforeEach(() => {
    loadLegacy()
  })

  it('is enabled by default', () => {
    mountForm({ domain: 'example.com', sitePassword: 'test' })
    expect(isStripProtocol()).toBe(true)
  })

  it('strips https:// and http:// from the site address before hashing (v1)', () => {
    for (const addr of ['https://example.com', 'http://example.com', 'http://www.example.com/x']) {
      mountForm({ domain: addr, sitePassword: 'test' })
      window.GenerateToTextField()
      expect(document.hashform.hashedPassword.value).toBe('MeJ8G9') // == plain 'example.com'
    }
  })

  it('strips the protocol case-insensitively (upstream bug: uppercase protocol broke extraction)', () => {
    mountForm({ domain: 'HTTPS://example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
  })

  it('applies to v2 as well', () => {
    loadExtended()
    setAlgorithm('v2')
    mountForm({ domain: 'HTTPS://example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('Uay)PZm%#3}v') // == plain 'example.com'
  })

  it('OFF restores legacy parsing (no stripping in Generate)', () => {
    setStripProtocol(false)
    expect(isStripProtocol()).toBe(false)
    mountForm({ domain: 'HTTPS://example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    // legacy extractDomain leaves the uppercase protocol as garbage realm
    expect(document.hashform.hashedPassword.value).not.toBe('MeJ8G9')
  })

  it('OFF keeps upstream behavior for lowercase protocols', () => {
    // extractDomain itself strips lowercase http(s):// — unchanged legacy path
    setStripProtocol(false)
    mountForm({ domain: 'https://example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
  })

  it('syncs the checkbox state', () => {
    mountForm({ domain: 'example.com', sitePassword: 'test' })
    setStripProtocol(false)
    expect(document.getElementById('stripSwitch').checked).toBe(false)
    setStripProtocol(true)
    expect(document.getElementById('stripSwitch').checked).toBe(true)
  })
})
