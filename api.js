const API_BASE = 'https://o-b-website.onrender.com/api';

function getToken() {
  return localStorage.getItem('obk_token') || '';
}

function authHeaders(isFormData = false) {
  const headers = { Authorization: `Bearer ${getToken()}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
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

// ── LISTINGS (public) ─────────────────────────────────────────────────────────
async function getListings(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  const res = await fetch(`${API_BASE}/listings${qs ? '?' + qs : ''}`);
  return handleResponse(res);
}

async function getListing(id) {
  const res = await fetch(`${API_BASE}/listings/${id}`);
  return handleResponse(res);
}

// ── LISTINGS (admin) ──────────────────────────────────────────────────────────
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

async function getStats() {
  const res = await fetch(`${API_BASE}/listings/stats`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ── SITE VISITS ───────────────────────────────────────────────────────────────
async function submitSiteVisit(data) {
  const res = await fetch(`${API_BASE}/site-visits`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return handleResponse(res);
}

async function getSiteVisits(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/site-visits${qs ? '?' + qs : ''}`, {
    headers: authHeaders(),
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

async function getSiteVisitStats() {
  const res = await fetch(`${API_BASE}/site-visits/stats`, { headers: authHeaders() });
  return handleResponse(res);
}