import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.cwd(), "out");
const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".pdf", "application/pdf"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".wasm", "application/wasm"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const normalizedPath = normalize(decodedPath).replace(
    /^(\.\.(\/|\\|$))+/,
    ""
  );
  const filePath = join(root, normalizedPath);

  if (!filePath.startsWith(root + sep) && filePath !== root) {
    return null;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    return join(filePath, "index.html");
  }

  if (existsSync(filePath)) {
    return filePath;
  }

  const nestedIndex = join(filePath, "index.html");
  if (existsSync(nestedIndex)) {
    return nestedIndex;
  }

  const fallback404 = join(root, "404.html");
  return existsSync(fallback404) ? fallback404 : null;
}

if (!existsSync(join(root, "index.html"))) {
  console.error(
    "out/ not found. Run `NEXT_PUBLIC_BASE_PATH= npm run build` first. " +
      "The variable keeps its Next-era name and is still live — " +
      "src/lib/basePath.ts reads it; the framework is gone, the name is not."
  );
  process.exit(1);
}

const server = createServer((request, response) => {
  const filePath = resolveRequestPath(request.url ?? "/");

  if (!filePath) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const type =
    contentTypes.get(extname(filePath)) ?? "application/octet-stream";
  response.writeHead(filePath.endsWith("404.html") ? 404 : 200, {
    "Content-Type": type,
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}`);
});
