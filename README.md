# calgen

Utility to generate a printable Hebrew-calendar family calendar: one HTML page
per Hebrew month, plus an iCal (`.ics`) file, built from family events
(birthdays, anniversaries, yahrzeits) stored in a Google Sheet.

## Tech stack

- **Node.js** (mixed CommonJS/ESM)
- [`@hebcal/core`](https://www.npmjs.com/package/@hebcal/core) — Hebrew calendar calculations
- [`googleapis`](https://www.npmjs.com/package/googleapis) — reads family event data from a Google Sheet
- [`ical-generator`](https://www.npmjs.com/package/ical-generator) — produces the `.ics` output
- [`fs-extra`](https://www.npmjs.com/package/fs-extra), [`lodash`](https://www.npmjs.com/package/lodash) — file/data helpers

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for a full breakdown of the code.

## Setup

```bash
npm install
```

To pull data from Google Sheets you'll need a `credentials.json` (Google OAuth
client secret) in the repo root. The first run will prompt for an auth code
and cache the token in `token.json`.

## Running

```bash
# Online: download latest data from the Sheet and generate a Hebrew year
node getgoogledata.js 5787

# Offline: regenerate from the last cached data (edit the year in genlocal.js)
node genlocal.js
```

Generated output (HTML pages + `.ics` file) is written to `out/<year>/`.
