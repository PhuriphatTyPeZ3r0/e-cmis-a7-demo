import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const TYPES = { ".css": "text/css", ".js": "application/javascript", ".html": "text/html" };

export function startServer(port = 8791) {
  const server = createServer(async (req, res) => {
    try {
      const filePath = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
      const ext = path.extname(filePath);
      const body = await readFile(filePath);
      res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream" });
      res.end(body);
    } catch (e) {
      res.writeHead(404);
      res.end("not found: " + req.url);
    }
  });
  return new Promise(resolve => server.listen(port, () => resolve(server)));
}
