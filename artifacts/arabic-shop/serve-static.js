const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST_DIR = path.resolve(__dirname, "dist");
const PORT = parseInt(process.env.PORT || "5000", 10);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".ttf":  "font/ttf",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".map":  "application/json",
};

const server = http.createServer((req, res) => {
  let urlPath = new URL(req.url, `http://localhost`).pathname;

  let filePath = path.join(DIST_DIR, urlPath);

  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";

  const cacheControl = ext === ".html"
    ? "no-store, no-cache, must-revalidate"
    : "public, max-age=31536000, immutable";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Serving Arabic Shop on port ${PORT}`);
});
