// === Static site generator for s-andante.org rebuild ===
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = {
  posts: JSON.parse(fs.readFileSync(path.join(ROOT, 'posts_full.json'), 'utf8')),
  pages: JSON.parse(fs.readFileSync(path.join(ROOT, 'pages_full.json'), 'utf8')),
  cats:  JSON.parse(fs.readFileSync(path.join(ROOT, 'categories.json'), 'utf8')),
  mediaMap: JSON.parse(fs.readFileSync(path.join(ROOT, 'media_mapping.json'), 'utf8')),
};

const catNames = {};
const catSlugs = {};
DATA.cats.forEach(c => { catNames[c.id] = c.name; catSlugs[c.id] = c.slug; });

// Sort posts by date desc
DATA.posts.sort((a,b) => (b.date||'').localeCompare(a.date||''));

function rewriteUrls(html) {
  if (!html) return '';
  return html
    .replace(/https?:\/\/s-andante\.org\/wp-content\/uploads\/([^"'\s)]+)/g, (m, p) => {
      try { p = decodeURIComponent(p.split('?')[0]); } catch(e) {}
      return BASE + '/' + path.join('media', p).replace(/\\/g,'/');
    })
    // Keep internal links pointing to our new structure
    .replace(/https?:\/\/s-andante\.org\//g, BASE + '/');
}

function decode(s) {
  if (!s) return '';
  return s
    .replace(/&#038;/g,'&').replace(/&amp;/g,'&')
    .replace(/&#8211;/g,'-').replace(/&ndash;/g,'-')
    .replace(/&#8217;/g,"'").replace(/&rsquo;/g,"'")
    .replace(/&#8220;/g,'"').replace(/&#8221;/g,'"')
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&nbsp;/g,' ');
}

function postUrl(p) {
  const d = (p.date||'').substring(0,10).split('-');
  if (d.length !== 3) return `${BASE}/posts/${p.id}/`;
  return `${BASE}/${d[0]}/${d[1]}/${d[2]}/${p.slug}/`;
}
function pageUrl(p) { return `${BASE}/${p.slug}/`; }
function catUrl(cid) { return `${BASE}/category/${catSlugs[cid] || cid}/`; }

// GitHub Pages project page lives under /s-andante/ — all internal absolute paths must be prefixed.
// If migrating to a custom domain, set BASE = '' and re-generate.
const BASE = '/s-andante';

const SITE = {
  name: '一般社団法人あんだんて',
  tagline: '地域住民の憩いの場づくり',
  desc: '福島県白河市・西郷村エリアで、こども食堂・きららかサロン・ユースプレイス・子育て相談室を運営する一般社団法人あんだんての公式サイト。',
  url: 'https://hideo-t.github.io/s-andante/',
  tel: '090-3759-4109',
  addr: '〒961-0855 福島県白河市高山西162-34',
};

// Nav grouped by 系統 (system/family). Items with `children` render as dropdowns.
const NAV = [
  {label:'ホーム', href:`${BASE}/`},
  {label:'きららか系', children:[
    {label:'きららかサロン', href:`${BASE}/kiraraka/`},
    {label:'若者の居場所ユースプレイス', href:`${BASE}/yp-2/`},
    {label:'子育て相談室', href:`${BASE}/%e5%ad%90%e8%82%b2%e3%81%a6%e7%9b%b8%e8%ab%87%e5%ae%a4/`},
  ]},
  {label:'らふみーる系', children:[
    {label:'こども＆みんなの食堂', href:`${BASE}/kodomos/`},
    {label:'らふみーる新白河', href:'https://hideo-t.github.io/rafmiir/', external:true},
  ]},
  {label:'活動実績', href:`${BASE}/shisetsu/`},
  {label:'ニュース', href:`${BASE}/news/`},
  {label:'ご支援企業', href:`${BASE}/%e3%81%94%e6%94%af%e6%8f%b4%e3%81%84%e3%81%9f%e3%81%a0%e3%81%84%e3%81%a6%e3%81%84%e3%82%8b%e4%bc%81%e6%a5%ad%e3%83%bb%e5%9b%a3%e4%bd%93%e4%b8%80%e8%a6%a7/`},
];

const RELATED_SHOPS = [
  {label:'大信のご飯屋さん', href:'https://r.goope.jp/taishingohanya/'},
  {label:'カフェるぽん', href:'https://tabelog.com/fukushima/A0703/A070301/7020106/'},
];

// Two-system hero on home page
const SYSTEMS = [
  {
    key:'kiraraka',
    label:'きららか系',
    en:'KIRARAKA FAMILY',
    image:`${BASE}/assets/hero_kiraraka.jpg`,
    desc:'地域の憩い・若者の居場所・子育てを支える「集う」系統。',
    items:[
      {label:'きららかサロン', href:`${BASE}/kiraraka/`},
      {label:'若者の居場所ユースプレイス', href:`${BASE}/yp-2/`},
      {label:'子育て相談室', href:`${BASE}/%e5%ad%90%e8%82%b2%e3%81%a6%e7%9b%b8%e8%ab%87%e5%ae%a4/`},
    ]
  },
  {
    key:'rafmiir',
    label:'らふみーる系',
    en:'RAFMIIR FAMILY',
    image:`${BASE}/assets/hero_rafmiir.jpg`,
    desc:'地域に温かい食を届ける「食」と「働く」の系統。',
    items:[
      {label:'こども＆みんなの食堂', href:`${BASE}/kodomos/`},
      {label:'らふみーる新白河', href:'https://hideo-t.github.io/rafmiir/', external:true},
    ]
  },
];

function pageShell(opts) {
  const { title, description, body, depth=0, canonical='' } = opts;
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  const css = prefix + 'assets/style.css';
  const safeDesc = (description || SITE.desc).replace(/"/g,'&quot;').replace(/<[^>]+>/g,'').substring(0,200);
  const safeTitle = title ? `${decode(title)}｜${SITE.name}` : SITE.name;
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeTitle}</title>
<meta name="description" content="${safeDesc}">
<meta property="og:title" content="${decode(title || SITE.name)}">
<meta property="og:description" content="${safeDesc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical || SITE.url}">
<meta property="og:image" content="${SITE.url}assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
<link rel="stylesheet" href="${css}">
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"NGO",
  "name":"${SITE.name}",
  "description":"${SITE.desc.substring(0,200)}",
  "url":"${SITE.url}",
  "telephone":"+819037594109",
  "address":{"@type":"PostalAddress","streetAddress":"高山西162-34","addressLocality":"白河市","addressRegion":"福島県","postalCode":"961-0855","addressCountry":"JP"}
}
</script>
</head>
<body>
<header class="site">
  <div class="header-inner">
    <a class="logo" href="${BASE}/">
      <div>
        <div class="mark">${SITE.name}</div>
        <div class="sub">${SITE.tagline}</div>
      </div>
    </a>
    <button class="nav-toggle" id="navToggle" aria-label="メニュー"><span></span><span></span><span></span></button>
    <nav class="site-nav" id="nav">
      ${NAV.map(n => {
        if (n.children) {
          return `<div class="nav-group">
        <button class="nav-trigger" type="button">${n.label} <span class="caret">▾</span></button>
        <div class="nav-drop">
          ${n.children.map(c => `<a href="${c.href}"${c.external ? ' target="_blank" rel="noopener"' : ''}>${c.label}${c.external ? ' ↗' : ''}</a>`).join('\n          ')}
        </div>
      </div>`;
        }
        return `<a href="${n.href}"${n.external ? ' target="_blank" rel="noopener"' : ''}>${n.label}${n.external ? ' ↗' : ''}</a>`;
      }).join('\n      ')}
    </nav>
  </div>
</header>

${body}

<footer class="site">
  <div class="org">${SITE.name}</div>
  <div class="addr">${SITE.addr}<br>TEL: ${SITE.tel}（山本）</div>
  <div class="links">
    <a href="${BASE}/">ホーム</a>
    <a href="${BASE}/news/">ニュース</a>
    <a href="${BASE}/shisetsu/">活動実績</a>
    <a href="https://hideo-t.github.io/rafmiir/" target="_blank" rel="noopener">らふみーる新白河 ↗</a>
    <a href="https://www.facebook.com/mitsuko.yamamot" target="_blank" rel="noopener">Facebook ↗</a>
  </div>

  <div class="related-shops">
    <div class="rs-label">関連店舗・グループ</div>
    <div class="rs-grid">
      ${RELATED_SHOPS.map(s => `<a href="${s.href}" target="_blank" rel="noopener">${s.label} ↗</a>`).join('\n      ')}
    </div>
  </div>

  <div class="copy">&copy; ${new Date().getFullYear()} ${SITE.name}</div>
</footer>
<script>
  var t = document.getElementById('navToggle');
  var n = document.getElementById('nav');
  if(t&&n){t.addEventListener('click',function(){t.classList.toggle('active');n.classList.toggle('open');});
  n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){t.classList.remove('active');n.classList.remove('open');});});}
</script>
</body>
</html>`;
}

function ensureDir(p) { fs.mkdirSync(p, {recursive:true}); }
function writeFile(rel, content) {
  const full = path.join(ROOT, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, 'utf8');
}

// Convert a URL (with BASE prefix) into a local file path under ROOT.
// e.g. /s-andante/news/ → news/index.html
function urlToFilePath(url) {
  let rel = url.startsWith(BASE) ? url.substring(BASE.length) : url;
  rel = rel.replace(/^\//, '');
  return path.join(rel, 'index.html');
}

// === HOME ===
function buildHome() {
  const latestPosts = DATA.posts.slice(0, 12);

  const body = `
<section class="hero-intro">
  <div class="wrap">
    <span class="badge">SHIRAKAWA · FUKUSHIMA</span>
    <h1>地域住民の<span class="accent">憩いの場</span>づくり<br>を、ずっと。</h1>
    <p class="lead">
      福島県白河市・西郷村で、地域に住む子どもやお年寄りたちと一緒に、まちに元気を与える活動を行ってきました。<br>
      二つの系統「きららか」と「らふみーる」——みなさんと一緒に、地域を元気にしていきます。
    </p>
  </div>
</section>

<section class="systems-hero">
  <div class="wrap">
    <div class="section-label">TWO FAMILIES</div>
    <h2 class="section-title">あんだんての二つの系統</h2>
    <div class="systems-grid">
      ${SYSTEMS.map(s => `
      <div class="sys-card sys-${s.key}">
        <div class="sys-img" style="background-image:url('${s.image}')"></div>
        <div class="sys-body">
          <div class="sys-en">${s.en}</div>
          <h3 class="sys-label">${s.label}</h3>
          <p class="sys-desc">${s.desc}</p>
          <ul class="sys-items">
            ${s.items.map(i => `<li><a href="${i.href}"${i.external ? ' target="_blank" rel="noopener"' : ''}>${i.label}${i.external ? ' ↗' : ' →'}</a></li>`).join('\n            ')}
          </ul>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="news-section">
  <div class="wrap">
    <div class="section-label">LATEST NEWS</div>
    <h2 class="section-title">新着情報</h2>
    <ul class="news-list">
      ${latestPosts.map(p => {
        const d = (p.date||'').substring(0,10);
        const cid = (p.categories||[])[0];
        const catName = cid ? catNames[cid] : '';
        return `<li>
          <span class="date">${d}</span>
          ${catName ? `<span class="cat cat-${cid}">${catName}</span>` : ''}
          <a class="ttl" href="${postUrl(p)}">${decode(p.title?.rendered||'')}</a>
        </li>`;
      }).join('')}
    </ul>
    <div class="news-more"><a href="${BASE}/news/">すべてのニュースを見る →</a></div>
  </div>
</section>
`;
  writeFile('index.html', pageShell({
    title: '',
    description: SITE.desc,
    body,
    canonical: SITE.url,
  }));
}

// === STATIC PAGES ===
function buildPages() {
  let count = 0;
  DATA.pages.forEach(p => {
    if (p.slug === 'login-customizer') return; // skip admin page
    const content = rewriteUrls(p.content?.rendered || '');
    const title = decode(p.title?.rendered || '');
    const body = `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${BASE}/">ホーム</a> &raquo; ${title}</div>
    <h1>${title}</h1>
  </div>
</section>
<article class="article">
  <div class="wrap">
    <div class="article-body">${content}</div>
  </div>
</article>
`;
    const url = pageUrl(p);
    const filePath = urlToFilePath(url);
    writeFile(filePath, pageShell({
      title,
      description: (content.replace(/<[^>]+>/g,'').substring(0,160)),
      body,
      depth: url.split('/').filter(Boolean).length,
      canonical: SITE.url + url.replace(/^\//,''),
    }));
    count++;
  });
  console.log(`  Pages built: ${count}`);
}

// === POSTS ===
function buildPosts() {
  let count = 0;
  DATA.posts.forEach((p, i) => {
    const prev = DATA.posts[i+1];
    const next = DATA.posts[i-1];
    const title = decode(p.title?.rendered || '');
    const content = rewriteUrls(p.content?.rendered || '');
    const d = (p.date||'').substring(0,10);
    const cid = (p.categories||[])[0];
    const catName = cid ? catNames[cid] : '';

    const body = `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${BASE}/">ホーム</a> &raquo; <a href="${BASE}/news/">ニュース</a>${catName ? ` &raquo; <a href="${catUrl(cid)}">${catName}</a>` : ''}</div>
    <h1>${title}</h1>
    <div class="meta">${d}${catName ? `<span class="cat">${catName}</span>` : ''}</div>
  </div>
</section>
<article class="article">
  <div class="wrap">
    <div class="article-body">${content}</div>
    <nav class="article-nav">
      ${prev ? `<a href="${postUrl(prev)}"><div class="lbl">PREVIOUS</div>${decode(prev.title?.rendered||'')}</a>` : '<span></span>'}
      ${next ? `<a class="next" href="${postUrl(next)}"><div class="lbl">NEXT</div>${decode(next.title?.rendered||'')}</a>` : '<span></span>'}
    </nav>
  </div>
</article>
`;
    const url = postUrl(p);
    const filePath = urlToFilePath(url);
    writeFile(filePath, pageShell({
      title,
      description: decode((p.excerpt?.rendered || '').replace(/<[^>]+>/g,'').substring(0,160)),
      body,
      depth: url.split('/').filter(Boolean).length,
      canonical: SITE.url + url.replace(/^\//,''),
    }));
    count++;
  });
  console.log(`  Posts built: ${count}`);
}

// === CATEGORY ARCHIVES ===
function buildCategoryArchives() {
  let count = 0;
  DATA.cats.forEach(cat => {
    const inCat = DATA.posts.filter(p => (p.categories||[]).includes(cat.id));
    if (inCat.length === 0) return;
    const body = `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${BASE}/">ホーム</a> &raquo; カテゴリ</div>
    <h1>${decode(cat.name)}</h1>
    <div class="meta">${inCat.length}件の投稿</div>
  </div>
</section>
<section class="news-section">
  <div class="wrap">
    <ul class="news-list">
      ${inCat.map(p => {
        const d = (p.date||'').substring(0,10);
        return `<li>
          <span class="date">${d}</span>
          <a class="ttl" href="${postUrl(p)}">${decode(p.title?.rendered||'')}</a>
        </li>`;
      }).join('')}
    </ul>
  </div>
</section>
`;
    const url = catUrl(cat.id);
    writeFile(urlToFilePath(url), pageShell({
      title: `${cat.name} カテゴリ`,
      description: `${cat.name}カテゴリの投稿一覧（${inCat.length}件）`,
      body,
      depth: url.replace(BASE,'').split('/').filter(Boolean).length,
      canonical: SITE.url + url.replace(BASE,'').replace(/^\//,''),
    }));
    count++;
  });
  console.log(`  Category archives: ${count}`);
}

// === NEWS ARCHIVE (paginated) ===
function buildNewsArchive() {
  const PER_PAGE = 30;
  const totalPages = Math.ceil(DATA.posts.length / PER_PAGE);
  for (let pg = 1; pg <= totalPages; pg++) {
    const start = (pg - 1) * PER_PAGE;
    const slice = DATA.posts.slice(start, start + PER_PAGE);
    const pagination = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === pg) pagination.push(`<span class="current">${i}</span>`);
      else pagination.push(`<a href="${i === 1 ? `${BASE}/news/` : `${BASE}/news/page/${i}/`}">${i}</a>`);
    }
    const body = `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${BASE}/">ホーム</a></div>
    <h1>ニュース・お知らせ</h1>
    <div class="meta">全${DATA.posts.length}件 / ${pg} of ${totalPages}</div>
  </div>
</section>
<section class="news-section">
  <div class="wrap">
    <ul class="news-list">
      ${slice.map(p => {
        const d = (p.date||'').substring(0,10);
        const cid = (p.categories||[])[0];
        const catName = cid ? catNames[cid] : '';
        return `<li>
          <span class="date">${d}</span>
          ${catName ? `<span class="cat cat-${cid}">${catName}</span>` : ''}
          <a class="ttl" href="${postUrl(p)}">${decode(p.title?.rendered||'')}</a>
        </li>`;
      }).join('')}
    </ul>
    <div class="pagination">${pagination.join('')}</div>
  </div>
</section>
`;
    const url = pg === 1 ? `${BASE}/news/` : `${BASE}/news/page/${pg}/`;
    writeFile(urlToFilePath(url), pageShell({
      title: pg === 1 ? 'ニュース・お知らせ' : `ニュース (${pg}/${totalPages})`,
      description: `あんだんての活動ニュース全${DATA.posts.length}件`,
      body,
      depth: url.split('/').filter(Boolean).length,
      canonical: SITE.url + url.replace(/^\//,''),
    }));
  }
  console.log(`  News archive pages: ${totalPages}`);
}

// === EXECUTE ===
console.log('=== Generating site ===');
buildHome();
console.log('  Home: built');
buildPages();
buildPosts();
buildCategoryArchives();
buildNewsArchive();

// Count generated HTML files
function countFiles(dir, ext) {
  let n = 0;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) n += countFiles(p, ext);
    else if (f.endsWith(ext)) n++;
  }
  return n;
}
const htmlCount = countFiles(ROOT, '.html');
console.log(`\n=== Total HTML files: ${htmlCount} ===`);
