const input = document.getElementById('videoId');
const list = document.getElementById('id-list');
const error = document.getElementById('error-message');
const getIds = async () => (await chrome.storage.sync.get('randomVideoIds')).randomVideoIds || [];

async function save(ids) {
  await chrome.storage.sync.set({ randomVideoIds: ids });
  list.replaceChildren(...ids.map((id) => {
    const div = Object.assign(document.createElement('div'), { className: 'id-item', textContent: id });
    const btn = Object.assign(document.createElement('button'), { className: 'remove-btn', textContent: 'הסר' });
    btn.onclick = async () => save((await getIds()).filter((x) => x !== id));
    div.append(btn);
    return div;
  }));
}

document.getElementById('addButton').onclick = async () => {
  const id = input.value.trim();
  const ids = await getIds();
  if (!/^[\w-]{11}$/.test(id)) return (error.textContent = 'ID לא תקין, אנא הכנס מזהה תקין.');
  if (ids.includes(id)) return (error.textContent = 'מזהה זה כבר קיים ברשימה.');
  error.textContent = input.value = '';
  save([...ids, id]);
};

getIds().then(save);
