import { describe, it, expect, beforeEach } from 'vitest'
import { loadLegacy, mountForm } from './helpers/loadLegacy.js'

describe('case-insensitive domain switch', () => {
  beforeEach(() => {
    loadLegacy()
    mountForm({ domain: 'Example.com', sitePassword: 'test' })
  })

  it('is enabled by default and lowercases the realm', () => {
    expect(isCaseInsensitive()).toBe(true)
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9') // == lowercase realm
  })

  it('OFF restores legacy case-sensitive hashing', () => {
    setCaseInsensitive(false)
    expect(isCaseInsensitive()).toBe(false)
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('4ukLGG') // == legacy
  })

  it('ON and OFF agree for already-lowercase input', () => {
    mountForm({ domain: 'example.com', sitePassword: 'test' })
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
    setCaseInsensitive(false)
    window.GenerateToTextField()
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
  })

  it('setCaseInsensitive syncs the checkbox state', () => {
    setCaseInsensitive(false)
    expect(document.getElementById('caseSwitch').checked).toBe(false)
    setCaseInsensitive(true)
    expect(document.getElementById('caseSwitch').checked).toBe(true)
  })
})
