// בודק מראש אם הסרטון הבא חסום (418 של נטפרי), מכין חלופה פתוחה, ומעביר אליה אם נחסם.
const DEFAULT_IDS = ['nuyT4iW05Jc', 'mSSevB5deHU', '2po4w1Ime4o'];
const vid = (url) => new URL(url, location.origin).searchParams.get('v');
const blocked = async (id) => (await fetch(`/watch?v=${id}`, { method: 'HEAD' }).catch(() => ({}))).status === 418;

async function findAlternative(title, exclude) {
  const words = title.split(/\s+/).filter((w) => /^[a-zA-Z֐-׿]+$/.test(w));
  for (const q of [words.slice(-2), words.slice(0, 2)].map((w) => w.join(' ')).filter(Boolean)) {
    const html = await fetch(`/results?search_query=${encodeURIComponent(q)}`).then((r) => r.text()).catch(() => '');
    const ids = [...new Set([...html.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]))];
    for (const id of ids.filter((id) => !exclude.includes(id)).slice(0, 10)) if (!(await blocked(id))) return id;
  }
  const { randomVideoIds: ids = DEFAULT_IDS } = await chrome.storage.sync.get('randomVideoIds');
  return ids[Math.floor(Math.random() * ids.length)];
}

async function check() {
  const current = vid(location.href);
  if (!current) return;
  if (await blocked(current)) {
    const alt = sessionStorage.getItem('nfAlt') || (await findAlternative(sessionStorage.getItem('nfTitle') || '', [current]));
    sessionStorage.removeItem('nfAlt');
    if (alt && alt !== current) location.replace(`/watch?v=${alt}`);
    return;
  }
  const title = document.querySelector('meta[name="title"]')?.content || document.title.replace(/ - YouTube$/, '');
  sessionStorage.setItem('nfTitle', title);
  sessionStorage.removeItem('nfAlt');
  await new Promise((r) => setTimeout(r, 1500)); // ממתין שכפתור "הבא" יתעדכן
  const next = document.querySelector('.ytp-next-button')?.href;
  if (next && vid(next) && (await blocked(vid(next))) && vid(location.href) === current) {
    sessionStorage.setItem('nfAlt', await findAlternative(title, [current, vid(next)]));
  }
}

document.addEventListener('yt-navigate-finish', check);
check();
