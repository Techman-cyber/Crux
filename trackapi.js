const e = encodeURIComponent;
const TYPES = { A: 1, CNAME: 5, NS: 2, MX: 15, TXT: 16, AAAA: 28, CAA: 257 };
const J = async (u, ms = 12000) => {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(u, { signal: c.signal, headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } finally { clearTimeout(t); }
};
const dnsQ = (name, t) =>
  J(`https://dns.google/resolve?name=${e(name)}&type=${t}`, 8000)
    .then(r => (r.Answer || []).filter(a => a.type === TYPES[t]).map(a => String(a.data).replace(/" "/g, '').replace(/^"|"$/g, '')))
    .catch(() => []);

function vcard(x) {
  const o = {};
  for (const [k, , , v] of (x.vcardArray?.[1] || [])) {
    if (k === 'fn') o.name = v;
    else if (k === 'org') o.org = [].concat(v).join(' ');
    else if (k === 'email') o.email = v;
    else if (k === 'tel') o.phone = String(v).replace('tel:', '');
    else if (k === 'adr') o.addr = [].concat(v).filter(Boolean).join(', ');
  }
  return o;
}
const walk = (es, out = []) => { for (const x of es || []) { out.push({ roles: x.roles || [], ...vcard(x) }); walk(x.entities, out); } return out; };

const jobs = {
  async rdap({ domain }) {
    const d = await J(`https://rdap.org/domain/${e(domain)}`);
    const events = {};
    (d.events || []).forEach(v => (events[v.eventAction] = v.eventDate));
    return { events, status: d.status || [], ns: (d.nameservers || []).map(n => (n.ldhName || '').toLowerCase()), entities: walk(d.entities), handle: d.handle };
  },
  async dns({ host, domain }) {
    const [A, AAAA, CNAME, MX, NS, TXT, CAA] = await Promise.all([
      dnsQ(host, 'A'), dnsQ(host, 'AAAA'), dnsQ(host, 'CNAME'),
      dnsQ(domain, 'MX'), dnsQ(domain, 'NS'), dnsQ(domain, 'TXT'), dnsQ(domain, 'CAA')]);
    return { A, AAAA, CNAME, MX, NS, TXT, CAA };
  },
  async net({ host }) {
    const a = await J(`https://dns.google/resolve?name=${e(host)}&type=A`, 8000);
    const ip = (a.Answer || []).find(x => x.type === 1)?.data;
    if (!ip) throw new Error('no ip');
    const g = await J(`https://ipwho.is/${e(ip)}`, 8000);
    return { ip, country: g.country, region: g.region, city: g.city, flag: g.flag?.emoji, asn: g.connection?.asn, org: g.connection?.org, isp: g.connection?.isp, tz: g.timezone?.id };
  },
  async wb({ domain }) {
    const r = await J(`https://web.archive.org/cdx/search/cdx?url=${e(domain)}&limit=1&output=json&fl=timestamp`, 15000);
    const t = r?.[1]?.[0];
    if (!t) throw new Error('none');
    return { first: `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}` };
  },
  async crt({ domain }) {
    const r = (await J(`https://crt.sh/?q=${e('%.' + domain)}&output=json`, 25000)).slice(0, 4000);
    const names = new Set(), iss = new Set();
    let first = null;
    for (const c of r) {
      String(c.name_value).split('\n').forEach(n => names.add(n.replace(/^\*\./, '').toLowerCase()));
      const m = /O=([^,]+)/.exec(c.issuer_name || '') || /CN=([^,]+)/.exec(c.issuer_name || '');
      if (m) iss.add(m[1]);
      if (c.not_before && (!first || c.not_before < first)) first = c.not_before;
    }
    return { names: [...names].sort(), issuers: [...iss].slice(0, 6), first, count: r.length };
  }
};

export { jobs };
