import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://id-preview--bd7dea3a-658d-4672-8f07-87005ad8d325.lovable.app";
const paths = ["/", "/search", "/favorites", "/stats", "/profile", "/premium"];

export const Route = createFileRoute("/sitemap.xml")({
  server: { handlers: { GET: async () => new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${BASE_URL}${path}</loc></url>`).join("\n")}\n</urlset>`,
    { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } },
  ) } },
});