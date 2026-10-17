const FEEDS = [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www.theguardian.com/world/rss',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://feeds.npr.org/1004/rss.xml'  // NPR World
];

async function fetchFeed(url) {
  try {
    const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    const res = await fetch(proxy);
    const data = await res.json();
    if (data.status === 'ok') {
      return data.items.map(item => ({
        title: item.title,
        link: item.link,
        description: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '',
        pubDate: item.pubDate,
        thumbnail: item.enclosure?.link || item.thumbnail || null,
        source: data.feed.title
      }));
    }
  } catch (e) {
    console.error('Feed error', url, e);
  }
  return [];
}

async function loadNews() {
  const container = document.getElementById('news-content');
  container.innerHTML = '<div class="loading">Loading latest international news...</div>';

  const allItems = [];
  for (const feed of FEEDS) {
    const items = await fetchFeed(feed);
    allItems.push(...items);
  }

  // Sort by date, take top 30
  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  const stories = allItems.slice(0, 30);

  if (stories.length === 0) {
    container.innerHTML = '<div class="loading">Unable to load news at this time. Please try again later.</div>';
    return;
  }

  // Lead story
  const lead = stories[0];
  const secondary = stories.slice(1, 5);
  const grid = stories.slice(5, 20);

  let html = `
    <div class="lead-section">
      <div class="lead-story">
        ${lead.thumbnail ? `<img src="${lead.thumbnail}" alt="" class="lead-image">` : ''}
        <h1><a href="${lead.link}" target="_blank" style="color:inherit;text-decoration:none">${lead.title}</a></h1>
        <p class="summary">${lead.description}</p>
        <div class="meta">${lead.source} · ${new Date(lead.pubDate).toLocaleString()}</div>
      </div>
      <div class="secondary-stories">
        ${secondary.map(s => `
          <div class="story-card">
            <h3><a href="${s.link}" target="_blank">${s.title}</a></h3>
            <div class="meta">${s.source} · ${new Date(s.pubDate).toLocaleDateString()}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <h2 style="font-family: 'Libre Baskerville', serif; margin: 20px 0 10px; font-size: 1.4rem;">More International Stories</h2>
    <div class="grid-section">
      ${grid.map(s => `
        <div class="grid-card">
          ${s.thumbnail ? `<img src="${s.thumbnail}" alt="">` : ''}
          <h3><a href="${s.link}" target="_blank">${s.title}</a></h3>
          <div class="meta">${s.source}</div>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', loadNews);
