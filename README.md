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
- All application files are **byte-identical to upstream** (verified via SHA-256
  comparison on 2026-10-11).
- The JavaScript contains **no network calls** (`XMLHttpRequest`, `fetch`,
  WebSockets, beacons): the hash is computed purely client-side. Your master
  password never leaves your browser. You can verify this yourself — the whole
  tool is four small JS files.

## Usage

Type the **site address** (e.g. `example.com`) and your **master password**;
the tool shows the generated site password. The browser extensions apply the
same transformation transparently:
[Firefox](https://addons.mozilla.org/en-US/firefox/addon/pwdhash/) ·
[Chrome](https://chrome.google.com/extensions/detail/dnfmcfhnhnpoehjoommondmlmhdoonca).

Tip (from upstream): you can save the page to disk and use it offline.

## License

BSD 3-clause (see the header of each source file).
Copyright 2004–2005 Stanford University — Blake Ross, Collin Jackson,
Nicholas Miyake, Dan Boneh, John C. Mitchell. See individual files for details.

## Development

Static site, no build step. The `gh-pages` branch is deployed by GitHub Pages
(custom domain `pwdhash.leufke.de` via the `CNAME` file).

- `index.html` — the form
- `pwdhash.js` — glue between form and hashing
- `hashed-password.js` — HMAC-MD5 derivation + password constraints
- `domain-extractor.js` — URL → registrable domain
- `md5.js` — MD5/HMAC-MD5 implementation
