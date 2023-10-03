# Factory

The factory is a tool for populating rotomuly's card database. It works by pulling card metadata from <https://pokemontcg.io>, manipulating and parsing the data into rotomly's DSL and structures, and then generating the JSON output for importing into database.

## Important

The cache _is_ stored with this repository, it is a massive amount of data and we want to avoid making too many calls to pokemontcg.io - effectively think of the cache as being read-only once created.

## Usage

Install dependencies with whatever tool you like, preferably pnpm:

```bash
pnpm install
```

Then simply start the process:

```bash
pnpm start
```

You'll see the output from each card and a summary at the end of the coverage of cards.