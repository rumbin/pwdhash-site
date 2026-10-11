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
  document.hashform.hashedPassword.value = "Press Generate";
  document.hashform.hashedPassword.disabled = true;
}

var SPH_kPasswordPrefix = "@@";

var SPH_caseInsensitive = true;

function isCaseInsensitive() { return SPH_caseInsensitive; }

function setCaseInsensitive(v) {
  SPH_caseInsensitive = !!v;
  var cb = document.getElementById('caseSwitch');
  if (cb) cb.checked = SPH_caseInsensitive;
}

var SPH_stripProtocol = true;

function isStripProtocol() { return SPH_stripProtocol; }

function setStripProtocol(v) {
  SPH_stripProtocol = !!v;
  var cb = document.getElementById('stripSwitch');
  if (cb) cb.checked = SPH_stripProtocol;
}

var SPH_algorithm = 'v1';

function getAlgorithm() { return SPH_algorithm; }

function setAlgorithm(v) {
  SPH_algorithm = (v == 'v2') ? 'v2' : 'v1';
  var cb = document.getElementById('algoSwitch');
  if (cb) cb.checked = (SPH_algorithm == 'v2');
  var badge = document.getElementById('algoBadge');
  if (badge) badge.textContent = SPH_algorithm;
}

/*
 * Returns a conforming hashed password generated from the form's field values.
 */
function Generate()
{
  var uri = document.hashform.domain.value;
  if (SPH_stripProtocol)
    uri = uri.replace(/^https?:\/\//i, '');
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
