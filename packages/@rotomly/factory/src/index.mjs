import fs from "fs";

import { cacher } from "./cache.mjs";

// If the cache dir *already* exists then we assume we have downloaded everything
const cacheDir = "cache";
const hasCache = fs.existsSync(cacheDir);

if (!hasCache) {
    fs.mkdirSync(cacheDir, { recursive: true });
    await cacher(cacheDir);
}
