import { describe, it, expect, beforeEach } from 'vitest'
import { loadLegacy, loadExtended } from './helpers/loadLegacy.js'

describe('v2 extended hashing', () => {
  beforeEach(() => {
    loadLegacy()
    loadExtended()
  })

  it('reproduces golden vectors from the Python reference', () => {
    // generated with tests/helpers/reference-v2.py
    expect(SPH_ExtendedHashedPassword('test', 'example.com')).toBe('Uay)PZm%#3}v')
    expect(SPH_ExtendedHashedPassword('abc', 'example.com')).toBe(';67U(we(+*5C')
    expect(SPH_ExtendedHashedPassword('a', 'example.com')).toBe('pyR)mbsPB4s0')
    expect(SPH_ExtendedHashedPassword('correct horse battery staple', 'example.com'))
      .toBe('FIC2l!hHC!@cSr#S!dH0QTaI)f5[M@_]7XFFnc)c-v(R0$CE3/^[FQ5F(]')
    expect(SPH_ExtendedHashedPassword('MyMaster1!', 'github.com'))
      .toBe('qjV2sw&:b5zirjIx.@Pge?')
  })

  it('uses the password literally (@@ stripping belongs to the form layer)', () => {
    // regression: the function used to strip '@@' a second time, so the form
    // and the function disagreed with v1 for '@@@@...' master passwords
    expect(SPH_ExtendedHashedPassword('@@test', 'example.com'))
      .toBe('ZUe1mSsQsq}Y(N')
    expect(SPH_ExtendedHashedPassword('@@test', 'example.com'))
      .not.toBe(SPH_ExtendedHashedPassword('test', 'example.com'))
  })

  it('is reproducible for non-ASCII master passwords (UTF-8 keying)', () => {
    // regression: core_hmac_md5 keys on the low byte of each UTF-16 unit,
    // the Python reference on UTF-8 — the JS now encodes UTF-8 explicitly
    expect(SPH_ExtendedHashedPassword('päss', 'example.com')).toBe('WWsY.SR2QNd)')
    expect(SPH_ExtendedHashedPassword('päss', 'beispiel.de')).toBe('f}ZU,b9g$_3$')
  })

  it('measures length in UTF-16 code units (astral chars count 2)', () => {
    // 'café😀' = 6 UTF-16 units -> L = 2*6+2 = 14
    expect(SPH_ExtendedHashedPassword('café😀', 'example.com'))
      .toBe('{Ko5Oz[JiNa;aM')
  })

  it('always contains one upper, lower, digit and special', () => {
    for (let i = 0; i < 500; i++) {
      const out = SPH_ExtendedHashedPassword('pw' + i, 'example.com')
      expect(out).toMatch(/[a-z]/)
      expect(out).toMatch(/[A-Z]/)
      expect(out).toMatch(/[0-9]/)
      expect(out).toMatch(/[!@#$%^&*()\-_=+\[\]{}:;,.?/]/)
    }
  })

  it('is about twice as long as the input password, min 12', () => {
    expect(SPH_ExtendedHashedPassword('a', 'example.com').length).toBe(12)            // 2*1+2=4 -> floor 12
    expect(SPH_ExtendedHashedPassword('test', 'example.com').length).toBe(12)         // 2*4+2=10 -> floor 12
    expect(SPH_ExtendedHashedPassword('1234567890', 'example.com').length).toBe(22)   // 2*10+2
    expect(SPH_ExtendedHashedPassword('correct horse battery staple', 'example.com').length).toBe(58) // 2*28+2
  })

  it('differs from v1 for the same input', () => {
    const v1 = String(new SPH_HashedPassword('test', 'example.com'))
    expect(SPH_ExtendedHashedPassword('test', 'example.com')).not.toBe(v1)
  })

  it('is deterministic', () => {
    expect(SPH_ExtendedHashedPassword('master', 'example.com'))
      .toBe(SPH_ExtendedHashedPassword('master', 'example.com'))
  })
})
