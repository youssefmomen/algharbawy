#!/usr/bin/env python3
# يولّد assets/data/meta.js من data.js: بيانات خفيفة للصفحة الرئيسية فقط
# شغّله بعد أي تعديل على data.js:  python3 tools/build-meta.py
import json, re, io, os

src = io.open('data.js', encoding='utf-8').read()
m = re.search(r'window\.SITE_DATA\s*=\s*', src)
assert m, 'SITE_DATA not found'
start = m.end()
# find matching JSON end: SITE_DATA is a JSON object ending with ; at line end
dec = json.JSONDecoder()
data, _ = dec.raw_decode(src[start:start+4_000_000])

def count(sec, sections_by_id):
    n = len(sec.get('lessons') or [])
    for c in (sec.get('courses') or []):
        n += len(c.get('lessons') or [])
    for cid in (sec.get('children') or []):
        ch = sections_by_id.get(cid)
        if ch:
            n += count(ch, sections_by_id)
    return n

by_id = {s['id']: s for s in data.get('sections', [])}

def slim(sec):
    own = bool(sec.get('lessons')) or bool(sec.get('courses'))
    out = {'id': sec['id'], 'title': sec.get('title', '')}
    for k in ('icon', 'description', 'group', 'href'):
        if sec.get(k) is not None:
            out[k] = sec[k]
    if sec.get('children'):
        out['children'] = sec['children']
    out['count'] = count(sec, by_id)
    out['live'] = own
    return out

meta = {
    'siteTitle': data.get('siteTitle', ''),
    'siteTagline': data.get('siteTagline', ''),
    'sections': [slim(s) for s in data.get('sections', [])],
    'tracks': [slim(s) for s in data.get('tracks', [])],
}

os.makedirs('assets/data', exist_ok=True)
body = '/* ملف مولّد تلقائيًا من data.js بواسطة tools/build-meta.py — لا تعدّله يدويًا */\n'
body += 'window.SITE_META=' + json.dumps(meta, ensure_ascii=False, separators=(',', ':')) + ';\n'
io.open('assets/data/meta.js', 'w', encoding='utf-8').write(body)
print('meta.js bytes:', len(body.encode('utf-8')))
print('sections:', len(meta['sections']), 'tracks:', len(meta['tracks']))
