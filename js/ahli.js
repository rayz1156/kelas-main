// DIMENSI membership for JomMain. Members get full access; everyone else can try every game at TP1 and TP2.
// dtconnect.org signs a ticket (ECDSA P-256) when someone registers or asks for a sign-in link.
// The browser checks the signature with the public key below, so JomMain stays a static site.
// The private key never leaves dtconnect.org (WordPress option dm_jm_keys).
import { h, store } from './core.js';

const PUBLIC_KEY = { kty: 'EC', crv: 'P-256', x: 'LdV8ZwV4Y7Z8zlYG-NU29ApofY-a1-olAL_AARwaM2o', y: 'znUfKOLUMdys1BVlJNGEclGlPNnVJJat12PrWBDFNqc', ext: true };
export const DAFTAR_URL = 'https://dtconnect.org/daftar/?dari=jommain';
export const PAUTAN_API = 'https://dtconnect.org/wp-json/dimensi/v1/jommain/pautan';
export const FREE_MAX_TP = 2;
export const FREE_MAX_TEAMS = 2;
export const FREE_MAX_SETS = 1;

const b64u = (s) => {
  const t = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(t + '='.repeat((4 - (t.length % 4)) % 4)), (c) => c.charCodeAt(0));
};

let keyPromise;
const key = () => (keyPromise ||= crypto.subtle.importKey('jwk', PUBLIC_KEY, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']));

/** Returns the ticket's payload {no, nama, iat, exp} if the signature is valid and not expired, else null. */
export async function verify(ticket) {
  try {
    const [data, sig] = String(ticket || '').split('.');
    if (!data || !sig) return null;
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, await key(), b64u(sig), new TextEncoder().encode(data));
    if (!ok) return null;
    const p = JSON.parse(new TextDecoder().decode(b64u(data)));
    return p && p.no && p.exp * 1000 > Date.now() ? p : null;
  } catch { return null; }
}

let member = null;
/** Resolves once the stored ticket has been checked. Await it before reading isMember(). */
export const ready = (async () => {
  const saved = store.get('ahli', null);
  member = saved ? await verify(saved.t) : null;
  if (saved && !member) store.set('ahli', null);
  return member;
})();

export const isMember = () => !!member;
export const memberInfo = () => member;

export async function signIn(ticket) {
  const p = await verify(ticket);
  if (p) { store.set('ahli', { t: ticket }); member = p; }
  return p;
}
export function signOut() { store.set('ahli', null); member = null; }

/** Remember where the teacher was, so ahli.html can send them back after signing up or in. */
export function rememberBack(url = location.href) { store.set('ahli:back', url); }
export const backUrl = () => store.get('ahli:back', '') || './';

const BENEFITS = [
  ['🎯', 'Semua tahap TP1 hingga TP4', 'Bukan ahli: TP1 dan TP2 sahaja'],
  ['🎁', 'Mod Papan Kejutan dan Lumba Masa', 'Bukan ahli: mod Klasik sahaja'],
  ['👥', 'Hingga 4 pasukan', 'Bukan ahli: 1 atau 2 pasukan'],
  ['📊', 'Simpan TP ke Laporan PBD dan muat turun CSV', 'Bukan ahli: tidak boleh simpan'],
  ['🛠️', 'Bina Set Soalan tanpa had dan kongsi pautan', 'Bukan ahli: 1 set, tanpa pautan kongsi'],
];
export const benefitList = () => h('ul', { class: 'perks' }, BENEFITS.map(([e, t, d]) => h('li', {}, h('span', { 'aria-hidden': 'true' }, e), h('b', {}, t), h('small', {}, d))));

/** Members-only panel. `what` names the locked feature, e.g. "TP3 dan TP4". */
export function gate(what) {
  document.querySelector('.gate-back')?.remove();
  const close = () => { back.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const back = h('div', { class: 'overlay gate-back', onclick: (e) => { if (e.target === back) close(); } },
    h('div', { class: 'gate', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Untuk ahli DIMENSI' },
      h('button', { class: 'icon-btn gate-x', type: 'button', 'aria-label': 'Tutup', onclick: close }, '✕'),
      h('div', { class: 'gate-lock', 'aria-hidden': 'true' }, '🔒'),
      h('h2', {}, `${what} untuk ahli DIMENSI`),
      h('p', {}, 'Keahlian DIMENSI (Digital Transformation Society) adalah ', h('b', {}, 'percuma'), '. Daftar sekali dalam masa satu minit, dan anda dibawa kembali ke sini dengan akses penuh.'),
      benefitList(),
      h('div', { class: 'row gate-actions' },
        h('a', { class: 'btn green', href: DAFTAR_URL, onclick: () => rememberBack() }, '✨ Daftar percuma'),
        h('a', { class: 'btn secondary', href: './ahli.html', onclick: () => rememberBack() }, '🔑 Saya sudah ahli'))));
  document.addEventListener('keydown', onKey, true);
  document.body.append(back);
  back.querySelector('.btn.green').focus();
}

/** Small header link: member number, or an invitation to join. */
export function badge() {
  return member
    ? h('a', { class: 'icon-btn member-badge on', href: './ahli.html', title: `Ahli DIMENSI: ${member.nama}`, style: { textDecoration: 'none' } }, '⭐ ', member.no)
    : h('a', { class: 'icon-btn member-badge', href: './ahli.html', onclick: () => rememberBack(), style: { textDecoration: 'none' } }, '🔓 Akses penuh');
}
