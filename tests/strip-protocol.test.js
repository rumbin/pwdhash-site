import { describe, it, expect, beforeEach } from 'vitest'
import { loadLegacy, loadExtended, mountForm } from './helpers/loadLegacy.js'

// Upstream contract: the protocol is always stripped from the site address.
// (Upstream's extractDomain does this case-sensitively; this fork strips
// case-insensitively so 'HTTPS://...' cannot leak a garbage realm into the hash.)
describe('http(s):// is always stripped from the site address', () => {
  beforeEach(() => {
    loadLegacy()
    mountForm({ domain: 'example.com', sitePassword: 'test' })
  })

  it('strips https:// and http://', () => {
    for (const addr of ['https://example.com', 'http://example.com', 'http://www.example.com/x']) {
      mountForm({ domain: addr, sitePassword: 'test' })
      window.GenerateToTextField()
      expect(document.hashform.hashedPassword.value).toBe('MeJ8G9') // == plain 'example.com'
    }
  })

  it('strips mixed-case protocols too (upstream bug fix)', () => {
    for (const addr of ['HTTPS://example.com', 'Http://Example.com', 'HTTPS://Example.COM/x']) {
      mountForm({ domain: addr, sitePassword: 'test' })
      window.GenerateToTextField()
      expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
    }
  })

  it('strips in v2 mode too', () => {
    loadExtended()
    setAlgorithm('v2')
    mountForm({ domain: 'HTTPS://example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('Uay)PZm%#3}v')
  })

  it('plain domains are unaffected', () => {
    mountForm({ domain: 'example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
    mountForm({ domain: 'Example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9') // case switch ON
  })
})
