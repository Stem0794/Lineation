importScripts('utils.js');

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action !== 'export') return;
  try {
    const settings = await getSettings();
    validateSettings(settings);
    let issue = { ...message.payload };
    if (settings.language) {
      try {
        issue.title = await translateText(issue.title, settings.language);
        issue.description = await translateText(issue.description, settings.language);
      } catch (e) { console.error('Translation failed', e); }
    }
    const markdown = formatMarkdown(issue);
    const pageUrl = await createNotionPage(settings, markdown);
    sendNotification('Export Successful', `Notion page created: ${pageUrl}`);
  } catch (error) {
    sendNotification('Export Failed', error.message);
  }
});

function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['notionToken','notionDB','language'], resolve);
  });
}

function validateSettings({ notionToken, notionDB }) {
  if (!notionToken) throw new Error('Missing Notion integration token.');
  if (!notionDB) throw new Error('Missing Notion database ID.');
}

function formatMarkdown(issue) {
  const description = issue.description || '_No description provided_';
  const labels = issue.labels.length ? issue.labels.join(', ') : 'None';
  return `🧠 Story
${issue.title}

❌ Current behavior

✅ Expected behavior
${description}

🧾 Metadata
Linear Issue: ${issue.url}

Status: ${issue.status}

Labels: ${labels}`;
}

async function createNotionPage({ notionToken, notionDB }, markdown) {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${notionToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parent: { database_id: notionDB },
      properties: {},
      children: [{
        object:'block', type:'paragraph', paragraph:{ rich_text:[{ type:'text', text:{ content: markdown } }] }
      }]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message||'Notion API error');
  return data.url;
}

const transparentIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBAQIA+4sAAAAASUVORK5CYII=';

function sendNotification(title, message) {
  chrome.notifications.create({ type:'basic', iconUrl: transparentIcon, title, message });
}
