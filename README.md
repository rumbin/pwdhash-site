# PwdHash — self-hosted web version

A self-hosted fork of the Stanford **PwdHash** remote web form, served at
**[https://pwdhash.leufke.de](https://pwdhash.leufke.de)** via GitHub Pages.

## What is PwdHash?

PwdHash generates *theft-resistant passwords*: instead of storing (or reusing) a
site password, you type your master password and the tool derives a site-specific
password from it and the site's domain:

```
hashed = b64_hmac_md5(masterPassword, domain)   → constrained to site password rules
```

If a site leaks its password database, the leaked password is useless elsewhere —
and you can re-derive the same password any time from your master password and
the domain. See the [Stanford PwdHash project](http://crypto.stanford.edu/PwdHash/)
and the [USENIX Security 2005 paper](http://crypto.stanford.edu/PwdHash/pwdhash.pdf).

## Why this fork?

The original `pwdhash.com` redirect host has broken TLS (its certificate is not
served at all, and the plain-HTTP fallback is an unencrypted redirect that can be
hijacked — unacceptable for a password tool). This fork serves the identical tool
over valid, auto-renewed HTTPS with enforced HTTPS redirect.

## Provenance & audit status

- Forked from [`collinjackson/pwdhash-website`](https://github.com/collinjackson/pwdhash-website)
  at commit `b75340edf9bfe9db82662fb6646651044cf92f72` (2017-06-01).
- The hashing core (`md5.js`, `hashed-password.js`, `domain-extractor.js`) is
  **byte-identical to upstream** (verified via SHA-256 on 2026-10-11) — v1
  output is untouched. The fork adds `extended-hashed-password.js` (v2) and
  revamps `index.html`/`pwdhash.css`/`pwdhash.js` (see git history).
- The JavaScript contains **no network calls** (`XMLHttpRequest`, `fetch`,
  WebSockets, beacons): the hash is computed purely client-side. Your master
  password never leaves your browser. You can verify this yourself — the whole
  tool is a handful of small JS files.

## Usage

Type the **site address** (e.g. `example.com`) and your **master password**;
the tool shows the generated site password. The browser extensions apply the
same transformation transparently:
[Firefox](https://addons.mozilla.org/en-US/firefox/addon/pwdhash/) ·
[Chrome](https://chrome.google.com/extensions/detail/dnfmcfhnhnpoehjoommondmlmhdoonca).

The **Case-insensitive site address** switch (on by default) lowercases the site
address before hashing, matching the browser extension; turn it off only to
reproduce passwords generated with mixed-case addresses in the old form.

Tip (from upstream): you can save the page to disk and use it offline.

## Algorithms

- **v1 (default)** — classic Stanford PwdHash: `b64_hmac_md5(password, domain)`
  with constraint tweaks. Identical output to the official browser extensions:
  every existing derived password keeps working.
- **v2 (opt-in switch)** — fork-local extension with a larger output alphabet
  (86 chars: `A-Z a-z 0-9` plus `!@#$%^&*()-_=+[]{}:;,.?/`), always containing
  one upper, lower, digit and special character, and roughly twice the length
  of the input password (minimum 12). Drawn by unbiased rejection sampling from
  HMAC-MD5 blocks tagged `PwdHash-2|<domain>|<counter>`.
  ⚠️ **v2 output is only reproducible with v2-capable tooling** (this site, or
  anything implementing the spec in `extended-hashed-password.js`) — the
  Stanford browser extensions cannot regenerate v2 passwords. The UI shows a
  `v1`/`v2` badge next to the output so you know which mode produced a hash.

  Reference implementation (used to generate the test golden vectors):
  `tests/helpers/reference-v2.py`.

## License

BSD 3-clause (see the header of each source file).
Copyright 2004–2005 Stanford University — Blake Ross, Collin Jackson,
Nicholas Miyake, Dan Boneh, John C. Mitchell. See individual files for details.

## Development

Static site, no build step. The `gh-pages` branch is deployed by GitHub Pages
(custom domain `pwdhash.leufke.de` via the `CNAME` file).

- `index.html` — the form (semantic, responsive)
- `pwdhash.js` — glue between form and hashing (switches live here)
- `hashed-password.js` — v1: HMAC-MD5 derivation + password constraints
- `extended-hashed-password.js` — v2: extended character set algorithm
- `domain-extractor.js` — URL → registrable domain
- `md5.js` — MD5/HMAC-MD5 implementation

Tests (Vitest + jsdom) pin upstream v1 behavior with golden vectors and lock
the v2 spec against an independent Python reference:

```bash
npm install
npm test
```
