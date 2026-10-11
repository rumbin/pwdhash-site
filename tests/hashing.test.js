import { describe, it, expect, beforeEach } from 'vitest'
import { loadLegacy, mountForm } from './helpers/loadLegacy.js'

describe('upstream hashing behavior (golden vectors)', () => {
  beforeEach(() => {
    loadLegacy()
  })

  it('extractDomain preserves case (upstream contract)', () => {
    const ex = new SPH_DomainExtractor()
    expect(ex.extractDomain('Example.COM/Path')).toBe('Example.COM')
    expect(ex.extractDomain('example.com')).toBe('example.com')
    expect(ex.extractDomain('www.example.co.uk')).toBe('example.co.uk')
    expect(ex.extractDomain('https://sub.example.com/x')).toBe('example.com')
  })

  it('hash uses the realm as HMAC key', () => {
    expect(String(new SPH_HashedPassword('test', 'example.com'))).toBe('MeJ8G9')
    expect(String(new SPH_HashedPassword('test', 'Example.com'))).toBe('4ukLGG')
    expect(String(new SPH_HashedPassword('@@test', 'example.com'))).toBe('fBUpu0+B')
  })

  it('Generate() strips the @@ prefix before hashing', () => {
    mountForm({ domain: 'example.com', sitePassword: '@@test' })
    window.GenerateToTextField()
    // '@@test' in the form hashes exactly like 'test' (prefix stripped first)
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
    expect(document.hashform.hashedPassword.disabled).toBe(false)
  })
})
