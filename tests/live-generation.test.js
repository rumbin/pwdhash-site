import { describe, it, expect, beforeEach } from 'vitest'
import { loadLegacy, loadExtended, mountForm } from './helpers/loadLegacy.js'

function type(el, value) {
  el.value = value
  el.dispatchEvent(new window.Event('input'))
}

describe('live generation (no Generate button)', () => {
  beforeEach(() => {
    loadLegacy()
    mountForm({ domain: 'example.com', sitePassword: '' })
    window.Init()
  })

  it('generates the hash while the site password is being typed', () => {
    type(document.hashform.sitePassword, 'test')
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
  })

  it('regenerates when the site address changes', () => {
    type(document.hashform.sitePassword, 'test')
    type(document.hashform.domain, 'github.com')
    expect(document.hashform.hashedPassword.value)
      .toBe(String(new SPH_HashedPassword('test', 'github.com')))
  })

  it('clears the hash when the password is cleared (never hashes empty input)', () => {
    type(document.hashform.sitePassword, 'test')
    expect(document.hashform.hashedPassword.value).not.toBe('')
    type(document.hashform.sitePassword, '')
    expect(document.hashform.hashedPassword.value).toBe('')
  })

  it('regenerates when a switch is toggled', () => {
    type(document.hashform.domain, 'Example.com')
    type(document.hashform.sitePassword, 'test')
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9') // case switch ON
    setCaseInsensitive(false)
    expect(document.hashform.hashedPassword.value).toBe('4ukLGG') // auto-updated
    setCaseInsensitive(true)
    expect(document.hashform.hashedPassword.value).toBe('MeJ8G9')
  })

  it('regenerates in v2 mode too', () => {
    loadExtended()
    setAlgorithm('v2')
    type(document.hashform.sitePassword, 'test')
    expect(document.hashform.hashedPassword.value).toBe('Uay)PZm%#3}v')
  })

  it('placeholder reflects live mode', () => {
    expect(document.hashform.hashedPassword.placeholder).toBe('Type to generate')
  })
})
