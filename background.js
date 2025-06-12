chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action !== 'export') return;
  try {
    const settings = await getSettings();
    validateSettings(settings);
    const markdown = formatMarkdown(message.payload);
    const pageUrl = await createNotionPage(settings, markdown);
    sendNotification('Export Successful', `Notion page created: ${pageUrl}`);
  } catch (error) {
    sendNotification('Export Failed', error.message);
  }
});

function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['notionToken','notionDB'], resolve);
  });
}

function validateSettings({ notionToken, notionDB }) {
  if (!notionToken) throw new Error('Missing Notion integration token.');
  if (!notionDB) throw new Error('Missing Notion database ID.');
}

function formatMarkdown(issue) {
  return `## 🧠 Story
${issue.title}

## ❌ Current behavior
_Describe the current behavior._

## ✅ Expected behavior
${issue.description}

## 🧾 Metadata
- Linear Issue: ${issue.url}
- Status: ${issue.status}
- Labels: ${issue.labels.join(', ')}`;
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

function sendNotification(title, message) {
  chrome.notifications.create({ type:'basic', iconUrl:'icons/icon48.png', title, message });
}