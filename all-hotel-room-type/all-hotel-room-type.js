/*
 * Create this table in Supabase before using:
 *
 * CREATE TABLE "indo_hotel_room_types" (
 *   id          BIGSERIAL PRIMARY KEY,
 *   hotel_name  TEXT NOT NULL,
 *   hotel_location TEXT DEFAULT '',
 *   hotel_area  TEXT DEFAULT '',
 *   room_types  JSONB DEFAULT '[]'::jsonb,
 *   booking_url TEXT DEFAULT '',
 *   created_at  TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at  TIMESTAMPTZ DEFAULT NOW()
 * );
 * -- To add booking_url to an existing table run:
 * -- ALTER TABLE "indo_hotel_room_types" ADD COLUMN IF NOT EXISTS booking_url TEXT DEFAULT '';
 */

const SUPABASE_URL = 'https://zrunsrimyijarswjfycw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydW5zcmlteWlqYXJzd2pmeWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjgzOTEsImV4cCI6MjA2MjMwNDM5MX0.UdW4LiIY-t1jZlrat1VUGnW0yRE7YEzW5SHbpkE29H8';
const TABLE = 'indo_hotel_room_types';

// ─── State ────────────────────────────────────────────────────────────────────
let db;
let hotels = [];
let currentFilter = '';
let openHotelIds = new Set();
let confirmCallback = null;
let _drag = null;
let isAdmin = false;   // false = staff (Arabic-only edit), true = full access

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  document.getElementById('search').addEventListener('input', e => {
    currentFilter = e.target.value;
    renderHotels();
  });

  document.getElementById('confirm-yes').addEventListener('click', () => {
    const cb = confirmCallback;
    closeConfirmModal();
    if (cb) cb();
  });

  await loadHotels();
}

// ─── Load ─────────────────────────────────────────────────────────────────────
async function loadHotels() {
  showLoading(true);

  const { data, error } = await db
    .from(TABLE)
    .select('*')
    .order('hotel_location', { ascending: true })
    .order('hotel_area',     { ascending: true })
    .order('hotel_name',     { ascending: true });

  showLoading(false);

  if (error) { showError(error); return; }

  hotels = data || [];

  renderHotels();
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderHotels() {
  const list = document.getElementById('hotels-list');
  list.classList.remove('hidden');

  const q = currentFilter.trim().toLowerCase();
  const filtered = q
    ? hotels.filter(h =>
        h.hotel_name.toLowerCase().includes(q) ||
        (h.hotel_location || '').toLowerCase().includes(q) ||
        (h.hotel_area     || '').toLowerCase().includes(q))
    : hotels;

  const countEl = document.getElementById('hotels-count');
  countEl.classList.remove('hidden');
  countEl.textContent = filtered.length + ' فندق';

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">لا توجد فنادق مطابقة للبحث</div>';
    return;
  }

  list.innerHTML = filtered.map(renderHotelCard).join('');

  openHotelIds.forEach(id => {
    const body   = document.querySelector('[data-hotel-body="'   + id + '"]');
    const toggle = document.querySelector('[data-hotel-toggle="' + id + '"]');
    if (body)   body.classList.add('open');
    if (toggle) toggle.classList.add('open');
  });
}

function renderHotelCard(hotel) {
  const loc      = [hotel.hotel_location, hotel.hotel_area].filter(Boolean).join(' · ');
  const addClick = isAdmin ? ` onclick="showAddRow(${hotel.id})"` : '';

  const bookingUrlRow = isAdmin ? `
        <div class="hotel-booking-url-row">
          <label class="booking-url-label">🔗 رابط الحجز (احتياطي):</label>
          <input type="url" class="booking-url-input" id="booking-url-${hotel.id}"
                 value="${esc(hotel.booking_url || '')}"
                 placeholder="https://..."
                 dir="ltr"
                 onchange="saveHotelBookingUrl(${hotel.id}, this.value)">
        </div>` : '';

  return `
    <div class="hotel-card" id="hcard-${hotel.id}">
      <div class="hotel-header" onclick="toggleHotel(${hotel.id})">
        <span class="hotel-toggle" data-hotel-toggle="${hotel.id}">▼</span>
        <div class="hotel-info">
          <div class="hotel-name-text">${esc(hotel.hotel_name)}</div>
          ${loc ? `<div class="hotel-location-text">${esc(loc)}</div>` : ''}
        </div>
      </div>
      <div class="hotel-body" data-hotel-body="${hotel.id}">
        ${bookingUrlRow}
        <div class="room-list" id="room-list-${hotel.id}">
          ${renderRoomRows(hotel)}
        </div>
        <div class="add-room-row" id="add-row-${hotel.id}">
          <button class="add-room-btn"${addClick}>+ إضافة نوع غرفة</button>
        </div>
      </div>
    </div>`;
}

function renderRoomRows(hotel) {
  const rooms = hotel.room_types || [];
  if (rooms.length === 0) {
    return '<div class="no-rooms">لا توجد أنواع غرف — أضف نوعاً أدناه</div>';
  }
  return rooms.map((rt, i) => roomViewRow(hotel.id, i, rt)).join('');
}

function roomViewRow(hotelId, index, rt) {
  // Identical HTML for both roles — handlers are omitted (not the elements) for staff.
  const enClick  = isAdmin ? ` onclick="editRoomRow(${hotelId},${index},'en')"` : '';
  const dragDown = isAdmin ? ` onpointerdown="startDrag(event,${hotelId},${index})"` : '';
  const delClick = isAdmin ? ` onclick="confirmDeleteRoom(${hotelId},${index})"` : '';
  const urlBtn   = isAdmin
    ? `<button class="btn btn-url${rt.video_url ? ' has-url' : ''}" onclick="editRoomVideoUrl(${hotelId},${index})" title="${rt.video_url ? 'تعديل رابط الفيديو' : 'إضافة رابط فيديو'}">🎥</button>`
    : (rt.video_url ? '<span class="room-has-video" title="يوجد رابط فيديو">🎥</span>' : '');
  return `
    <div class="room-item" id="room-row-${hotelId}-${index}">
      <span class="room-ar-name" onclick="editRoomRow(${hotelId},${index},'ar')">${esc(rt.ar || '—')}</span>
      <span class="room-en-name"${enClick}>${esc(rt.en || '—')}</span>
      <div class="room-item-actions">
        ${urlBtn}
        <span class="drag-handle"${dragDown} title="اسحب لإعادة الترتيب">⠿</span>
        <button class="btn btn-delete"${delClick} title="حذف">🗑️</button>
      </div>
    </div>`;
}

function roomEditRow(hotelId, index) {
  // Same layout for both roles — English textarea is readonly for staff.
  const enReadonly = isAdmin ? '' : ' readonly';
  const delClick   = isAdmin ? ` onclick="confirmDeleteRoom(${hotelId},${index})"` : '';
  return `
    <div class="room-item editing" id="room-row-${hotelId}-${index}">
      <textarea class="room-inline-input rtl"
                id="edit-ar-${hotelId}-${index}"
                placeholder="الاسم بالعربية"
                rows="1"
                oninput="syncEditHeights(${hotelId},${index})"
                onblur="handleEditBlur(${hotelId},${index})"
                onkeydown="handleEditKey(event,${hotelId},${index})"></textarea>
      <textarea class="room-inline-input ltr"
                id="edit-en-${hotelId}-${index}"
                placeholder="English name"
                dir="ltr"
                rows="1"${enReadonly}
                oninput="syncEditHeights(${hotelId},${index})"
                onblur="handleEditBlur(${hotelId},${index})"
                onkeydown="handleEditKey(event,${hotelId},${index})"></textarea>
      <div class="room-item-actions">
        <button class="btn btn-delete"${delClick} title="حذف">🗑️</button>
      </div>
    </div>`;
}

function toggleHotel(id) {
  const body   = document.querySelector('[data-hotel-body="'   + id + '"]');
  const toggle = document.querySelector('[data-hotel-toggle="' + id + '"]');
  if (!body) return;
  const open = body.classList.toggle('open');
  toggle.classList.toggle('open', open);
  if (open) openHotelIds.add(id); else openHotelIds.delete(id);
}

// ─── Inline edit ──────────────────────────────────────────────────────────────
function editRoomRow(hotelId, index, focusField = 'en') {
  if (document.querySelector('.room-item.editing')) return;

  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) return;
  const rt = (hotel.room_types || [])[index];
  if (!rt) return;

  const row = document.getElementById('room-row-' + hotelId + '-' + index);
  if (!row) return;

  row.outerHTML = roomEditRow(hotelId, index);

  const enEl = document.getElementById('edit-en-' + hotelId + '-' + index);
  const arEl = document.getElementById('edit-ar-' + hotelId + '-' + index);
  if (enEl) enEl.value = rt.en || '';
  if (arEl) arEl.value = rt.ar || '';
  syncEditHeights(hotelId, index);
  if (focusField === 'ar' && arEl) arEl.focus();
  else if (enEl) enEl.focus();
}

function handleEditKey(event, hotelId, index) {
  if (event.key === 'Escape') {
    cancelEdit(hotelId, index);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    commitEdit(hotelId, index);
  }
}

// Blur fires per-input; we use a short timeout so both inputs can blur
// before we decide whether to save (avoids saving when tabbing between them).
let _editBlurTimer = {};

function handleEditBlur(hotelId, index) {
  const key = hotelId + '-' + index;
  clearTimeout(_editBlurTimer[key]);
  _editBlurTimer[key] = setTimeout(() => {
    // Check if focus is still inside this row
    const en = document.getElementById('edit-en-' + hotelId + '-' + index);
    const ar = document.getElementById('edit-ar-' + hotelId + '-' + index);
    if (document.activeElement === en || document.activeElement === ar) return;
    commitEdit(hotelId, index);
  }, 120);
}

async function commitEdit(hotelId, index) {
  const arInput = document.getElementById('edit-ar-' + hotelId + '-' + index);
  if (!arInput) return; // row already committed or cancelled

  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) return;

  const rooms = [...(hotel.room_types || [])];
  const old = rooms[index] || {};

  const newAr = arInput.value.trim();
  let newEn;

  if (isAdmin) {
    const enInput = document.getElementById('edit-en-' + hotelId + '-' + index);
    if (!enInput) return;
    newEn = enInput.value.trim();
  } else {
    newEn = old.en || ''; // staff: preserve existing English text
  }

  // No change — just restore view
  if (newEn === (old.en || '') && newAr === (old.ar || '')) {
    restoreViewRow(hotelId, index, old);
    return;
  }

  rooms[index] = { ...old, en: newEn, ar: newAr };

  // Optimistic update
  hotel.room_types = rooms;
  restoreViewRow(hotelId, index, rooms[index]);

  // Patch only this hotel's room_types field
  const { error } = await db.from(TABLE)
    .update({ room_types: rooms })
    .eq('id', hotelId);

  if (error) {
    showToast('خطأ في الحفظ');
    hotel.room_types[index] = old; // rollback
    const row = document.getElementById('room-row-' + hotelId + '-' + index);
    if (row) row.outerHTML = roomViewRow(hotelId, index, old);
  } else {
    showToast('تم الحفظ ✓');
  }
}

function cancelEdit(hotelId, index) {
  const hotel = hotels.find(h => h.id === hotelId);
  const rt = (hotel.room_types || [])[index] || { en: '', ar: '' };
  restoreViewRow(hotelId, index, rt);
}

function restoreViewRow(hotelId, index, rt) {
  const row = document.getElementById('room-row-' + hotelId + '-' + index);
  if (row) row.outerHTML = roomViewRow(hotelId, index, rt);
}

// ─── Add room type ────────────────────────────────────────────────────────────
function showAddRow(hotelId) {
  const addRowEl = document.getElementById('add-row-' + hotelId);
  if (!addRowEl) return;

  addRowEl.innerHTML = `
    <div class="new-room-row">
      <textarea class="room-inline-input rtl" id="new-ar-${hotelId}" placeholder="الاسم بالعربية" rows="1" oninput="autoResize(this)"></textarea>
      <textarea class="room-inline-input ltr" id="new-en-${hotelId}" placeholder="English name" dir="ltr" rows="1" oninput="autoResize(this)"></textarea>
      <div class="new-room-actions">
        <button class="btn btn-primary btn-sm" onclick="commitAdd(${hotelId})">+ إضافة</button>
        <button class="btn btn-secondary btn-sm" onclick="cancelAdd(${hotelId})">✕</button>
      </div>
    </div>`;

  const enEl = document.getElementById('new-en-' + hotelId);
  if (enEl) enEl.focus();
}

async function commitAdd(hotelId) {
  const enInput = document.getElementById('new-en-' + hotelId);
  const arInput = document.getElementById('new-ar-' + hotelId);
  if (!enInput || !arInput) return;

  const newEn = enInput.value.trim();
  const newAr = arInput.value.trim();

  if (!newEn && !newAr) { showToast('أدخل الاسم بالإنجليزية أو العربية'); return; }

  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) return;

  const rooms = [...(hotel.room_types || []), { en: newEn, ar: newAr }];

  // Patch only this hotel's room_types field
  const { error } = await db.from(TABLE)
    .update({ room_types: rooms })
    .eq('id', hotelId);

  if (error) { showToast('خطأ في الإضافة'); return; }

  hotel.room_types = rooms;
  openHotelIds.add(hotelId);

  // Re-render just this hotel's room list and add row
  const listEl = document.getElementById('room-list-' + hotelId);
  const addRowEl = document.getElementById('add-row-' + hotelId);
  if (listEl) listEl.innerHTML = renderRoomRows(hotel);
  if (addRowEl) addRowEl.innerHTML = `<button class="add-room-btn" onclick="showAddRow(${hotelId})">+ إضافة نوع غرفة</button>`;

  showToast('تمت الإضافة ✓');
}

function cancelAdd(hotelId) {
  const addRowEl = document.getElementById('add-row-' + hotelId);
  if (addRowEl) addRowEl.innerHTML = `<button class="add-room-btn" onclick="showAddRow(${hotelId})">+ إضافة نوع غرفة</button>`;
}

// ─── Delete room ──────────────────────────────────────────────────────────────
function confirmDeleteRoom(hotelId, roomIndex) {
  const hotel = hotels.find(h => h.id === hotelId);
  const room  = (hotel.room_types || [])[roomIndex] || {};
  document.getElementById('confirm-message').textContent =
    `هل تريد حذف نوع الغرفة "${room.en || room.ar}"؟`;
  confirmCallback = () => deleteRoom(hotelId, roomIndex);
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirmModal() {
  document.getElementById('confirm-modal').classList.add('hidden');
  confirmCallback = null;
}

async function deleteRoom(hotelId, roomIndex) {
  const hotel = hotels.find(h => h.id === hotelId);
  const rooms = [...(hotel.room_types || [])];
  rooms.splice(roomIndex, 1);

  // Patch only this hotel's room_types field
  const { error } = await db.from(TABLE)
    .update({ room_types: rooms })
    .eq('id', hotelId);

  if (error) { showToast('خطأ في الحذف'); return; }

  hotel.room_types = rooms;
  openHotelIds.add(hotelId);

  const listEl = document.getElementById('room-list-' + hotelId);
  if (listEl) listEl.innerHTML = renderRoomRows(hotel);

  showToast('تم الحذف');
}

// ─── Drag & drop reorder ──────────────────────────────────────────────────────
function startDrag(event, hotelId, index) {
  event.preventDefault();

  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) return;

  const listEl  = document.getElementById('room-list-' + hotelId);
  const sourceRow = document.getElementById('room-row-' + hotelId + '-' + index);
  if (!listEl || !sourceRow) return;

  const rect = sourceRow.getBoundingClientRect();

  const ghost = sourceRow.cloneNode(true);
  ghost.removeAttribute('id');
  ghost.style.cssText =
    `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;` +
    `z-index:1000;pointer-events:none;border-radius:8px;` +
    `background:#bbdefb;box-shadow:0 6px 20px rgba(0,0,0,0.22);` +
    `transform:scale(1.02);opacity:0.92;transition:none;`;
  document.body.appendChild(ghost);

  sourceRow.classList.add('drag-placeholder');
  document.body.classList.add('is-dragging');

  event.target.setPointerCapture(event.pointerId);

  _drag = {
    hotelId,
    ghost,
    sourceRow,
    listEl,
    startY: event.clientY,
    ghostInitialTop: rect.top,
  };

  document.addEventListener('pointermove', _onDragMove, { passive: false });
  document.addEventListener('pointerup',     _onDragEnd,  { once: true });
  document.addEventListener('pointercancel', _onDragEnd,  { once: true });
}

function _onDragMove(event) {
  if (!_drag) return;
  event.preventDefault();

  _drag.ghost.style.top = (_drag.ghostInitialTop + (event.clientY - _drag.startY)) + 'px';

  const otherRows = [..._drag.listEl.querySelectorAll('.room-item')]
    .filter(el => el !== _drag.sourceRow);

  let insertBefore = null;
  for (const row of otherRows) {
    const r = row.getBoundingClientRect();
    if (event.clientY < r.top + r.height / 2) { insertBefore = row; break; }
  }

  if (insertBefore) {
    _drag.listEl.insertBefore(_drag.sourceRow, insertBefore);
  } else {
    _drag.listEl.appendChild(_drag.sourceRow);
  }
}

async function _onDragEnd() {
  if (!_drag) return;
  document.removeEventListener('pointermove', _onDragMove);

  const { hotelId, ghost, sourceRow, listEl } = _drag;
  _drag = null;

  ghost.remove();
  sourceRow.classList.remove('drag-placeholder');
  document.body.classList.remove('is-dragging');

  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) return;

  const oldTypes = hotel.room_types || [];
  const rowEls   = [...listEl.querySelectorAll('.room-item')];
  const newOrder  = rowEls.map(el => {
    const oldIndex = parseInt(el.id.split('-').pop(), 10);
    return oldTypes[oldIndex];
  }).filter(rt => rt !== undefined);

  const changed = newOrder.some((rt, i) => rt !== oldTypes[i]);
  if (!changed) return;

  hotel.room_types  = newOrder;
  listEl.innerHTML  = renderRoomRows(hotel);

  const { error } = await db.from(TABLE)
    .update({ room_types: newOrder })
    .eq('id', hotelId);

  showToast(error ? 'خطأ في حفظ الترتيب' : 'تم حفظ الترتيب ✓');
}

// ─── Video URL per room type (admin only) ─────────────────────────────────────
async function editRoomVideoUrl(hotelId, index) {
  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) return;
  const rt = (hotel.room_types || [])[index];
  if (!rt) return;

  const currentUrl = rt.video_url || '';
  const newUrl = prompt(
    'رابط فيديو الغرفة: "' + (rt.ar || rt.en) + '"\nاتركه فارغاً لإزالة الرابط:',
    currentUrl
  );
  if (newUrl === null) return;

  const trimmed = newUrl.trim();
  if (trimmed === currentUrl) return;

  const rooms = [...(hotel.room_types || [])];
  rooms[index] = { ...rooms[index], video_url: trimmed };

  const { error } = await db.from(TABLE).update({ room_types: rooms }).eq('id', hotelId);
  if (error) { showToast('خطأ في حفظ الرابط'); return; }

  hotel.room_types = rooms;
  const row = document.getElementById('room-row-' + hotelId + '-' + index);
  if (row) row.outerHTML = roomViewRow(hotelId, index, rooms[index]);
  showToast(trimmed ? 'تم حفظ رابط الفيديو ✓' : 'تم حذف الرابط ✓');
}

// ─── Booking URL per hotel (admin only) ───────────────────────────────────────
async function saveHotelBookingUrl(hotelId, url) {
  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) return;

  const trimmed = (url || '').trim();
  if (trimmed === (hotel.booking_url || '')) return;

  const { error } = await db.from(TABLE).update({ booking_url: trimmed }).eq('id', hotelId);
  if (error) {
    showToast('خطأ في حفظ رابط الحجز');
    const input = document.getElementById('booking-url-' + hotelId);
    if (input) input.value = hotel.booking_url || '';
    return;
  }

  hotel.booking_url = trimmed;
  showToast(trimmed ? 'تم حفظ رابط الحجز ✓' : 'تم حذف الرابط ✓');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function syncEditHeights(hotelId, index) {
  const enEl = document.getElementById('edit-en-' + hotelId + '-' + index);
  const arEl = document.getElementById('edit-ar-' + hotelId + '-' + index);
  if (!enEl || !arEl) return;
  enEl.style.height = 'auto';
  arEl.style.height = 'auto';
  const h = Math.max(enEl.scrollHeight, arEl.scrollHeight);
  enEl.style.height = h + 'px';
  arEl.style.height = h + 'px';
}

function showLoading(show) {
  document.getElementById('loading-state').classList.toggle('hidden', !show);
  if (show) document.getElementById('hotels-list').classList.add('hidden');
}

function showError(error) {
  document.getElementById('hotels-list').classList.remove('hidden');
  document.getElementById('hotels-list').innerHTML = `
    <div class="error-state">
      <strong>خطأ في الاتصال بقاعدة البيانات</strong><br>
      ${error.message || error}<br>
      تأكد من إنشاء الجدول في Supabase:
      <code>CREATE TABLE "indo_hotel_room_types" (
  id BIGSERIAL PRIMARY KEY,
  hotel_name TEXT NOT NULL,
  hotel_location TEXT DEFAULT '',
  hotel_area TEXT DEFAULT '',
  room_types JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);</code>
    </div>`;
}

let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('visible'), 2200);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Access control ───────────────────────────────────────────────────────────
function toggleLock() {
  if (isAdmin) {
    // Lock: drop back to staff mode
    isAdmin = false;
    const btn = document.getElementById('lock-btn');
    btn.textContent = '🔒';
    btn.classList.remove('unlocked');
    renderHotels();
    showToast('تم تسجيل الخروج — وضع الموظف');
  } else {
    openPasswordModal();
  }
}

function openPasswordModal() {
  document.getElementById('password-input').value = '';
  document.getElementById('password-error').classList.add('hidden');
  document.getElementById('password-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('password-input').focus(), 60);
}

function closePasswordModal() {
  document.getElementById('password-modal').classList.add('hidden');
}

function submitPassword() {
  const val = document.getElementById('password-input').value;
  if (val === 'bndr123') {
    isAdmin = true;
    const btn = document.getElementById('lock-btn');
    btn.textContent = '🔓';
    btn.classList.add('unlocked');
    closePasswordModal();
    renderHotels();
    showToast('مرحباً — صلاحيات كاملة ✓');
  } else {
    document.getElementById('password-error').classList.remove('hidden');
    document.getElementById('password-input').value = '';
    document.getElementById('password-input').focus();
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  function tryInit() {
    if (window.supabase && typeof window.supabase.createClient === 'function') init();
    else setTimeout(tryInit, 80);
  }
  tryInit();
});
