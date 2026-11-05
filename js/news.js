const FEEDS = [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www.theguardian.com/world/rss',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://feeds.npr.org/1004/rss.xml'
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(value) {
  try {
    const url = new URL(String(value));
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
  } catch {
    /* feed item had no usable URL */
  }
  return '';
}

function formatWhen(value, withTime) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
}

async function fetchFeed(url) {
  try {
    const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    const res = await fetch(proxy);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !Array.isArray(data.items)) return [];
    const source = data.feed?.title || 'Wire';
    return data.items.map(item => {
      const plain = String(item.description || '').replace(/<[^>]*>/g, '').slice(0, 200);
      return {
        title: item.title || 'Untitled',
        link: safeUrl(item.link),
        description: plain ? `${plain}...` : '',
        pubDate: item.pubDate,
        thumbnail: safeUrl(item.enclosure?.link || item.thumbnail),
        source
      };
    });
  } catch (error) {
    console.error('Feed error', url, error);
    return [];
  }
}

function storyLink(story, inner) {
  if (!story.link) return inner;
  return `<a href="${escapeHtml(story.link)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
}

async function loadNews() {
  const container = document.getElementById('news-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">Loading latest international news...</div>';

  const batches = await Promise.all(FEEDS.map(fetchFeed));
  const allItems = batches.flat();
  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  const stories = allItems.slice(0, 30);

  if (stories.length === 0) {
    container.innerHTML = '<div class="loading">Unable to load news at this time. Please try again later.</div>';
    return;
  }

  const lead = stories[0];
  const secondary = stories.slice(1, 5);
  const grid = stories.slice(5, 20);
  const leadImage = lead.thumbnail
    ? `<img src="${escapeHtml(lead.thumbnail)}" alt="" class="lead-image">`
    : '';

  container.innerHTML = `
    <div class="lead-section" id="top">
      <div class="lead-story">
        ${leadImage}
        <h1>${storyLink(lead, escapeHtml(lead.title))}</h1>
        <p class="summary">${escapeHtml(lead.description)}</p>
        <div class="meta">${escapeHtml(lead.source)} · ${escapeHtml(formatWhen(lead.pubDate, true))}</div>
      </div>
      <div class="secondary-stories">
        ${secondary.map(story => `
          <div class="story-card">
            <h3>${storyLink(story, escapeHtml(story.title))}</h3>
            <div class="meta">${escapeHtml(story.source)} · ${escapeHtml(formatWhen(story.pubDate, false))}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <h2 id="more" style="font-family: 'Libre Baskerville', serif; margin: 20px 0 10px; font-size: 1.4rem;">More International Stories</h2>
    <div class="grid-section">
      ${grid.map(story => `
        <div class="grid-card">
          ${story.thumbnail ? `<img src="${escapeHtml(story.thumbnail)}" alt="">` : ''}
          <h3>${storyLink(story, escapeHtml(story.title))}</h3>
          <div class="meta">${escapeHtml(story.source)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadNews);
