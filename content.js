(function() {
  const observerConfig = { childList: true, subtree: true };

  function injectButton() {
    if (document.querySelector('#export-to-notion-btn')) return;
    const header = document.querySelector('header');
    if (!header) return;

    const button = document.createElement('button');
    button.id = 'export-to-notion-btn';
    button.textContent = '📄 Export to Notion';
    button.addEventListener('click', () => {
      const issue = parseIssue();
      chrome.runtime.sendMessage({ action: 'export', payload: issue });
    });

    header.appendChild(button);
  }

  function parseIssue() {
    const titleEl = document.querySelector('[data-testid="IssueTitle"]');
    const descEl = document.querySelector('[data-testid="IssueDescription"]');
    const labelEls = document.querySelectorAll('[data-testid="Label"]');
    const statusEl = document.querySelector('[data-testid="StateBadge"]');

    const labels = Array.from(labelEls).map(el => el.textContent.trim());

    return {
      title: titleEl?.innerText.trim() || '',
      description: descEl?.innerText.trim() || '',
      labels,
      status: statusEl?.innerText.trim() || '',
      url: window.location.href
    };
  }

  const observer = new MutationObserver(injectButton);
  observer.observe(document.body, observerConfig);
})();
