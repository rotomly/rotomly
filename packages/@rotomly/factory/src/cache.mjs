import fs from "fs";
import path from "path";
import { Readable } from "stream";

import { MultiBar, SingleBar, Presets } from "cli-progress";
import { default as retry } from "promise-retry";

async function getPage(page = 1) {
  return retry(
    async (retry) => {
      try {
        return (
          await fetch(`https://api.pokemontcg.io/v2/cards?page=${page}`)
        ).json();
      } catch (err) {
        retry(err);
      }
    },
    { retries: 10 }
  );
}

async function getImage(url, p) {
  return retry(
    async (retry) => {
      try {
        const s = fs.createWriteStream(p);
        const r = Readable.fromWeb((await fetch(url)).body);
        r.pipe(s);
      } catch (err) {
        //console.error(url, p);
        retry(err);
      }
    },
    { retries: 10 }
  );
}

/**
 * Store the contents of a card
 */
async function store(card, dir = "cache") {
  const finalCard = card;
  const p = path.resolve(dir, card.id);

  // Create the cache path
  fs.mkdirSync(p, { recursive: true });

  // Write the JSON
  fs.writeFileSync(
    path.resolve(p, "index.json"),
    JSON.stringify(finalCard, null, 2),
    "utf-8"
  );

  // Store the card images
  if (card.images?.small) {
    await getImage(card.images.small, path.resolve(p, "small.png"));
  }

  if (card.images?.large) {
    await getImage(card.images.large, path.resolve(p, "large.png"));
  }
}

const defaultOptions = {
  dir: "cache",
  startPage: 1,
  setupEntryBar: (count) => {},
  setupPageBar: (count) => {},
  doneEntry: () => {},
  donePage: () => {},
};

export default async function cacher(opts = {}) {
  // Opts with sane defaults
  opts = { ...defaultOptions, ...opts };

  // Get the first page to determine the bounds
  const p1 = await getPage(1);

  // Get the total number of pages
  const totalPages = Math.ceil(p1.totalCount / p1.pageSize);

  // Setup the bars
  opts.setupEntryBar(p1.totalCount);
  opts.setupPageBar(totalPages);

  // Create all the promises to "grab" each page and process it
  const promises = new Array(totalPages).fill(null).map((_, i) => {
    return async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const page = i === 0 ? p1 : await getPage(i + 1);
          for (const card of page.data) {
            await store(card, opts.dir);
            opts.doneEntry();
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    };
  });

  for (let i = opts.startPage - 1; i < promises.length; ++i) {
    await promises[i]();
    opts.donePage();
  }
}

const mbar = new MultiBar({}, Presets.shades_classic);
const entryBar = mbar.create();
const pageBar = mbar.create();

try {
  await cacher({
    dir: "cache",
    startPage: 1,
    setupEntryBar: (count) => entryBar.setTotal(count),
    setupPageBar: (count) => pageBar.setTotal(count),
    doneEntry: () => entryBar.increment(),
    donePage: () => pageBar.increment(),
  });
  mbar.stop();
} catch (err) {
  mbar.stop();
  console.error(err);
  process.exit(1);
}
