const te = new TextEncoder(), td = new TextDecoder();
export const b64 = b => { const u = new Uint8Array(b); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode(...u.subarray(i, i + 8192)); return btoa(s); };
export const ub64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
export async function derive(pass, salt, iter) {
  const base = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}
export const exportKey = async k => b64(await crypto.subtle.exportKey('raw', k));
export const importKey = s => crypto.subtle.importKey('raw', ub64(s), 'AES-GCM', false, ['encrypt', 'decrypt']);
export async function encrypt(key, data, meta) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(data)));
  return { ...meta, iv: b64(iv), ct: b64(ct) };
}
export async function decrypt(key, blob) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub64(blob.iv) }, key, ub64(blob.ct));
  return JSON.parse(td.decode(pt));
}
