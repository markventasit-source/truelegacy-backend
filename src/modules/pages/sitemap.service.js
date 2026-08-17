const Blogs = require("./blogs.model");

const STATIC_PAGES = [
  { path: "", priority: "1.0" },
  { path: "/succession", priority: "0.9" },
  { path: "/readiness-survey", priority: "0.9" },
  { path: "/why-choose-us", priority: "0.9" },
  { path: "/resources", priority: "1.0" },
  { path: "/articles-news-events", priority: "0.9" },
  { path: "/contact", priority: "1.0" },
  { path: "/services/will", priority: "0.9" },
  { path: "/services/trust", priority: "0.9" },
  { path: "/privacy-policy", priority: "0.9" },
  { path: "/terms-of-service", priority: "0.9" },
];

exports.generateSitemap = async (siteOrigin) => {
  const base = siteOrigin.replace(/\/+$/, "");
  const now = new Date().toISOString();

  const blogs = await Blogs.find(
    { status: "published", slug: { $exists: true, $ne: "" } },
    { slug: 1, updatedAt: 1, createdAt: 1 },
  ).lean();

  const rows = [];
  for (const p of STATIC_PAGES) {
    rows.push(`  <url>
    <loc>${base}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <priority>${p.priority}</priority>
  </url>`);
  }
  for (const b of blogs) {
    if (!b.slug) continue;
    rows.push(`  <url>
    <loc>${base}/resources/${b.slug}</loc>
    <lastmod>${(b.updatedAt || b.createdAt || now).toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join("\n")}
</urlset>
`;
};
