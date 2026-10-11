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

  it('strips the @@ prefix like v1', () => {
    expect(SPH_ExtendedHashedPassword('@@test', 'example.com'))
      .toBe(SPH_ExtendedHashedPassword('test', 'example.com'))
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
