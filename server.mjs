// zebratime — the site, served as a harness MultiSite child.
//
// Harness owns 80/443, terminates TLS via SNI, and proxies by Host to this
// process on its assigned PORT. So this is display code only: plain HTTP on
// PORT, a /health probe for harness, and the static files. No own TLS and no
// webhook — those belong to the front.
//
// No dependencies on purpose. zebratime is a published npm module; anything
// added here would land in every `npm i zebratime`. node:http is enough to
// hand back a handful of files.

import http from 'node:http';
import fs from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = import.meta.dirname;
const port = parseInt(process.env.PORT || 4080);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// Map a request path to a file inside root, or null if it escapes or hides.
function locate(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const rel = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const file = resolve(join(root, rel === '/' ? 'index.html' : rel));
  if (file !== root && !file.startsWith(root + sep)) return null;
  if (rel.split('/').some((part) => part.startsWith('.'))) return null;
  return file;
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') return res.writeHead(200).end('ok');

  const file = locate(req.url);
  if (!file) return res.writeHead(403).end('Forbidden');

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return res.writeHead(404).end('Not found');
    res.writeHead(200, {
      'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size
    });
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(port, () => console.log(`zebratime listening on :${port}`));

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
