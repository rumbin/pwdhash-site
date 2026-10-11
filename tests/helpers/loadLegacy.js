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

export function mountForm({ domain = '', sitePassword = '', hashedPassword = '' } = {}) {
  document.body.innerHTML = `
    <form name="hashform">
      <input name="domain" value="${domain}" />
      <input name="sitePassword" type="password" value="${sitePassword}" />
      <input name="hashedPassword" value="${hashedPassword}" />
      <label><input type="checkbox" id="caseSwitch" checked
        onchange="setCaseInsensitive(this.checked)" /></label>
      <label><input type="checkbox" id="algoSwitch"
        onchange="setAlgorithm(this.checked ? 'v2' : 'v1')" /></label>
      <span id="algoBadge"></span>
    </form>`
  // jsdom lacks named form-control access (form.domain); browsers have it.
  // Shim it so unmodified legacy code (document.hashform.domain.value) works.
  const form = document.forms[0]
  for (const ctl of form.elements) {
    if (ctl.name && !(ctl.name in form)) {
      Object.defineProperty(form, ctl.name, { get: () => form.elements[ctl.name] })
    }
  }
}
