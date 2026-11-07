#!/usr/bin/env node
/* Write public/sitemap.xml. The site is hash-routed, so search engines only see real paths:
 * the page, the data files, the API and MCP roots, and the text guides. Generated at assembly. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const m = JSON.parse(fs.readFileSync(path.join(root, "public/graph/manifest.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10);
const urls = [
  ["/", m.snapshot, "weekly", "1.0"],
  ["/llms.txt", m.snapshot, "monthly", "0.8"],
  ["/llms-full.txt", m.snapshot, "weekly", "0.7"],
  ["/graph/graph.json", m.snapshot, "weekly", "0.9"],
  ["/graph/graph.jsonld", m.snapshot, "weekly", "0.6"],
  ["/graph/manifest.json", m.snapshot, "weekly", "0.5"],
  ["/graph/activity.json", today, "daily", "0.5"],
  ["/graph/feed.json", today, "daily", "0.5"],
  ["/api", m.snapshot, "monthly", "0.7"],
  ["/api/openapi.json", m.snapshot, "monthly", "0.5"],
  ["/mcp", m.snapshot, "monthly", "0.7"],
  ["/reconstruction/", m.snapshot, "monthly", "0.3"]
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(([u, d, f, p]) => `  <url><loc>https://humanrepairmap.com${u}</loc><lastmod>${d}</lastmod><changefreq>${f}</changefreq><priority>${p}</priority></url>`).join("\n") + `\n</urlset>\n`;
fs.writeFileSync(path.join(root, "public/sitemap.xml"), xml);
console.log(`wrote public/sitemap.xml (${urls.length} urls)`);
