/*
 * Remote PwdHash
 * A JavaScript implementation of the PwdHash hashing algorithm.
 * Version 1.0 Copyright (C) Stanford University 2004-2006
 * Author: Collin Jackson
 * Other Contributors: Dan Boneh, John Mitchell, Nick Miyake, and Blake Ross
 * Distributed under the BSD License
 * See http://crypto.stanford.edu/PwdHash for more info.
 * Requires the Javascript MD5 library, available here: http://pajhome.org.uk/crypt/md5
 */

/*
 * Initialize page with default hashing parameters.
 */
function Init() {
  document.hashform.domain.value = "http://www.example.com/";
  document.hashform.sitePassword.value = "";
  document.hashform.hashedPassword.value = "";
  document.hashform.hashedPassword.placeholder = "Type to generate";
  document.hashform.hashedPassword.disabled = true;
  // all event wiring lives here (no inline handlers — the page ships a strict
  // Content-Security-Policy with script-src 'self')
  // live generation: recompute while the user types
  if (document.hashform.domain.addEventListener)
    document.hashform.domain.addEventListener('input', UpdateHash);
  if (document.hashform.sitePassword.addEventListener)
    document.hashform.sitePassword.addEventListener('input', UpdateHash);
  var form = document.hashform;
  if (form.addEventListener) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      UpdateHash();
    });
    var caseSwitch = document.getElementById('caseSwitch');
    if (caseSwitch) caseSwitch.addEventListener('change', function () {
      setCaseInsensitive(this.checked);
    });
    var algoSwitch = document.getElementById('algoSwitch');
    if (algoSwitch) algoSwitch.addEventListener('change', function () {
      setAlgorithm(this.checked ? 'v2' : 'v1');
    });
    var revealBtn = document.getElementById('revealBtn');
    if (revealBtn) revealBtn.addEventListener('click', toggleReveal);
    var copyBtn = document.getElementById('copyBtn');
    if (copyBtn) copyBtn.addEventListener('click', copyHashedPassword);
  }
}

/*
 * Regenerate the hash live while the form is being filled.
 * An empty site password clears the output (never hash an empty password).
 */
function UpdateHash() {
  if (!document.hashform || !document.hashform.sitePassword) return;
  if (document.hashform.sitePassword.value == "" || !hasSiteAddress()) {
    document.hashform.hashedPassword.value = "";
    return;
  }
  GenerateToTextField();
}

function hasSiteAddress() {
  var uri = document.hashform.domain.value || "";
  return /[^\/\s]/.test(uri.replace(/^https?:\/\//i, ""));
}

var SPH_kPasswordPrefix = "@@";

var SPH_caseInsensitive = true;

function isCaseInsensitive() { return SPH_caseInsensitive; }

function setCaseInsensitive(v) {
  SPH_caseInsensitive = !!v;
  var cb = document.getElementById('caseSwitch');
  if (cb) cb.checked = SPH_caseInsensitive;
  UpdateHash();
}

var SPH_revealed = false;

function isRevealed() { return SPH_revealed; }

function toggleReveal() {
  SPH_revealed = !SPH_revealed;
  var field = document.hashform.hashedPassword;
  if (field) field.type = SPH_revealed ? 'text' : 'password';
  var btn = document.getElementById('revealBtn');
  if (btn) {
    btn.setAttribute('aria-pressed', SPH_revealed ? 'true' : 'false');
    btn.setAttribute('aria-label', SPH_revealed ? 'Hide password' : 'Reveal password');
    btn.title = SPH_revealed ? 'Hide password' : 'Reveal password';
    if (btn.classList) btn.classList.toggle('revealed', SPH_revealed);
  }
}

function copyHashedPassword() {
  var field = document.hashform.hashedPassword;
  var value = field ? field.value : '';
  function feedback(text) {
    var btn = document.getElementById('copyBtn');
    if (!btn) return;
    var target = btn.querySelector ? (btn.querySelector('.btn-label') || btn) : btn;
    var original = target.getAttribute('data-label') || 'Copy';
    target.setAttribute('data-label', original);
    target.textContent = text;
    setTimeout(function () { target.textContent = original; }, 1500);
  }
  function fallbackCopy() {
    var ok = false;
    if (field) {
      field.focus();
      field.select();
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    }
    feedback(ok ? 'Copied!' : 'Copy failed');
    return ok;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(value).then(
      function () { feedback('Copied!'); },
      function () { fallbackCopy(); } // rejected (permissions etc.)
    );
  }
  // no clipboard API (non-secure context, e.g. saved page opened from disk)
  return fallbackCopy();
}

var SPH_algorithm = 'v1';

function getAlgorithm() { return SPH_algorithm; }

function setAlgorithm(v) {
  SPH_algorithm = (v == 'v2') ? 'v2' : 'v1';
  var cb = document.getElementById('algoSwitch');
  if (cb) cb.checked = (SPH_algorithm == 'v2');
  var badge = document.getElementById('algoBadge');
  if (badge) badge.textContent = SPH_algorithm;
  UpdateHash();
}

/*
 * Returns a conforming hashed password generated from the form's field values.
 */
function Generate()
{
  var uri = document.hashform.domain.value;
  // upstream contract: the protocol is always stripped (case-insensitively,
  // unlike upstream's case-sensitive replace, so HTTPS:// cannot leak a
  // garbage realm into the hash)
  uri = uri.replace(/^https?:\/\//i, '');
  if (!/[^\/\s]/.test(uri))
    return ''; // no site address -> no hash (extractDomain would throw)
  var domain = (new SPH_DomainExtractor()).extractDomain(uri);
  if (SPH_caseInsensitive)
    domain = domain.toLowerCase();
  var size = SPH_kPasswordPrefix.length;
  var data = document.hashform.sitePassword.value;
  if (data.substring(0, size) == SPH_kPasswordPrefix)
    data = data.substring(size);
  if (SPH_algorithm == 'v2')
    return SPH_ExtendedHashedPassword(data, domain);
  var result = new String(new SPH_HashedPassword(data, domain));
  return result;
}

/*
 * Obtain a conforming hashed password and put it in the hashed password field
 */
function GenerateToTextField()
{
  document.hashform.hashedPassword.value = Generate();
  document.hashform.hashedPassword.disabled = false;
}

// boot: wire events when the page loads (replaces the old body onLoad,
// which would violate the page's Content-Security-Policy)
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('load', function () {
    if (document.hashform) Init();
  });
}
