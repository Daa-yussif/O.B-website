const API_BASE = 'https://o-b-backend.onrender.com/api';

/* ── Helpers ─────────────────────────────────────────────────────── */
function getToken() {
  return localStorage.getItem('obk_token') || '';
}

function authHeaders(isFormData = false) {
  const h = { Authorization: `Bearer ${getToken()}` };
  // If sending FormData, the browser automatically sets the Content-Type with boundary
  if (!isFormData) h['Content-Type'] = 'application/json';
  return h;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

/* ══════════════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════════════ */

async function adminLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  localStorage.setItem('obk_token', data.token);
  return data;
}

function adminLogout() {
  localStorage.removeItem('obk_token');
}

/* ══════════════════════════════════════════════════════════════════
   LISTINGS (public reads, protected writes)
══════════════════════════════════════════════════════════════════ */

async function getListings(params = {}) {
  const filteredParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value != null) filteredParams.append(key, value);
  }
  const qs = filteredParams.toString();
  const res = await fetch(`${API_BASE}/listings${qs ? '?' + qs : ''}`);
  return handleResponse(res);
}

async function getListing(id) {
  const res = await fetch(`${API_BASE}/listings/${id}`);
  return handleResponse(res);
}

async function getStats() {
  const res = await fetch(`${API_BASE}/listings/stats`, { 
    headers: authHeaders() 
  });
  return handleResponse(res);
}

async function createListing(formData) {
  const res = await fetch(`${API_BASE}/listings`, {
    method:  'POST',
    headers: authHeaders(true), 
    body:    formData,
  });
  return handleResponse(res);
}

async function updateListing(id, formData) {
  const res = await fetch(`${API_BASE}/listings/${id}`, {
    method:  'PUT',
    headers: authHeaders(true),
    body:    formData,
  });
  return handleResponse(res);
}

async function deleteListing(id) {
  const res = await fetch(`${API_BASE}/listings/${id}`, {
    method:  'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/* ══════════════════════════════════════════════════════════════════
   SITE VISITS (public submit, protected reads/updates/deletes)
══════════════════════════════════════════════════════════════════ */

async function submitSiteVisit(data) {
  const res = await fetch(`${API_BASE}/site-visits`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return handleResponse(res);
}

async function getSiteVisits(params = {}) {
  const filteredParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value != null) filteredParams.append(key, value);
  }
  const qs = filteredParams.toString();
  const res = await fetch(`${API_BASE}/site-visits${qs ? '?' + qs : ''}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

async function getSiteVisitStats() {
  const res = await fetch(`${API_BASE}/site-visits/stats`, { 
    headers: authHeaders() 
  });
  return handleResponse(res);
}

async function updateSiteVisitStatus(id, status) {
  const res = await fetch(`${API_BASE}/site-visits/${id}/status`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify({ status }),
  });
  return handleResponse(res);
}

async function deleteSiteVisit(id) {
  const res = await fetch(`${API_BASE}/site-visits/${id}`, {
    method:  'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}