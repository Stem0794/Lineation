document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['notionToken','notionDB','language'], ({ notionToken='', notionDB='', language='' }) => {
    document.getElementById('notionToken').value = notionToken;
    document.getElementById('notionDB').value = notionDB;
    document.getElementById('language').value = language;
  });
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const token = document.getElementById('notionToken').value.trim();
  const db = document.getElementById('notionDB').value.trim();
  const language = document.getElementById('language').value.trim();
  chrome.storage.sync.set({ notionToken: token, notionDB: db, language }, () => setStatus('Settings saved.'));
});

document.getElementById('testBtn').addEventListener('click', async () => {
  setStatus('Testing...');
  const token = document.getElementById('notionToken').value.trim();
  const db = document.getElementById('notionDB').value.trim();
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${db}`, { headers:{ 'Authorization':`Bearer ${token}`,'Notion-Version':'2022-06-28'}});
    if (!res.ok) throw new Error('Invalid credentials.');
    setStatus('Connection successful!');
  } catch(e) { setStatus(`Error: ${e.message}`); }
});

function setStatus(msg) { document.getElementById('status').textContent = msg; }