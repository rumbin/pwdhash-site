import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..', '..')

export function loadLegacy() {
  for (const f of ['md5.js', 'hashed-password.js', 'domain-extractor.js', 'pwdhash.js']) {
    const src = readFileSync(join(root, f), 'utf8')
    // indirect eval -> global scope, like a <script> tag
    ;(0, eval)(src)
  }
}

export function loadExtended() {
  const src = readFileSync(join(root, 'extended-hashed-password.js'), 'utf8')
  ;(0, eval)(src)
}

// NB: loadLegacy() must run first — v2 reuses core_hmac_md5 (md5.js)
// and SPH_kPasswordPrefix (pwdhash.js).

export function mountForm({ domain = '', sitePassword = '', hashedPassword = '' } = {}) {
  // Mount the REAL form from index.html — no duplicated fixture that can drift
  // from production markup. Values are set afterwards (the form ships empty).
  const html = readFileSync(join(root, 'index.html'), 'utf8')
  const formHtml = html.match(/<form[\s\S]*?<\/form>/)[0]
  document.body.innerHTML = formHtml

  // jsdom lacks named form-control access (form.domain); browsers have it.
  // Shim it so unmodified legacy code (document.hashform.domain.value) works.
  const form = document.forms[0]
  for (const ctl of form.elements) {
    if (ctl.name && !(ctl.name in form)) {
      Object.defineProperty(form, ctl.name, { get: () => form.elements[ctl.name] })
    }
  }

  form.domain.value = domain
  form.sitePassword.value = sitePassword
  form.hashedPassword.value = hashedPassword
}
