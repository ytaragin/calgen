# calgen — Architecture & Code Reference

A Node.js program that reads family events (birthdays, anniversaries, yahrtzeits)
from a Google Spreadsheet and generates a printable **Hebrew-calendar** year:
one HTML page per Hebrew month, plus an iCal (`.ics`) file of the events.

---

## 1. High-level flow

```
Google Sheet ──▶ getgoogledata.js ──▶ last_data.txt (cache)
                        │                    │
                        │                    ▼
                        │              genlocal.js  (regenerate from cache)
                        ▼                    │
                     gen.js  ◀───────────────┘
                        │  genYear(year, data)
                        ▼
   ┌────────────────────┼─────────────────────────┐
   ▼                    ▼                          ▼
copy template/    per-month HTML             calendar_<year>.ics
 to out/<year>/   (htmlbuilder.js)           (ical-generator)
```

Two entry points, **same generation core**:

- **`getgoogledata.js`** — downloads live data from Google Sheets, caches it to
  `last_data.txt`, then calls `genYear`.
- **`genlocal.js`** — skips the network; reads `last_data.txt` and calls `genYear`.

---

## 2. Entry points

### `getgoogledata.js` (download + generate)
- OAuth2 against Google Sheets API using `credentials.json`; token cached in
  `token.json` (first run prompts for an auth code via console).
- `SCOPES = ['https://www.googleapis.com/auth/spreadsheets']`.
- `downloaddata(auth)` reads spreadsheet `15VLso_uBt51KkgtXY8TonFEgh4YkElXoFCTwek51GFI`,
  range `Data!A2:E`. Columns map to:
  | Col | Field       | Example              |
  |-----|-------------|----------------------|
  | A   | `monthName` | `Tishrei`, `Adar_II` |
  | B   | `date`      | `17` (day of month)  |
  | C   | `type`      | `Birthday` / `Anniversary` / `Yahrzeit` |
  | D   | `name1`     | primary name         |
  | E   | `name2`     | spouse (anniversaries only) |
- Writes the mapped array to **`last_data.txt`** (JSON), then calls `genYear(year, data)`.
- **Year selection:** first CLI arg, else default `5787`.
  Run: `node getgoogledata.js 5787`
- `listMajors` is unused sample/quickstart code.

### `genlocal.js` (offline regenerate)
- Reads `last_data.txt`, `JSON.parse`, calls `genYear(year, data)`.
- **Year is hard-coded**: `gen_local(5786);` (line 23). Change here to pick a year offline.

> Note: entry points use CommonJS `require`, but `gen.js` and its deps use ESM
> `import`/`export`. This mismatch is a known quirk of the current setup.

---

## 3. Generation core — `gen.js`

Exports: `genCalendar`, `genYear`, `MyEvent`.

### `genYear(year, events)` — top-level orchestrator
1. `fillIncomingData(events)` — adds numeric `.month` to each record via
   `HebCal.months[monthName.toUpperCase()]`.
2. `outputDir = out/<year>`; copies `template/` there (CSS + images).
3. If the year is **not** a leap year (`monthsInYear < 13`), `combineAdars` remaps
   month 13 (Adar II) → month 12 so Adar records land correctly.
4. `addEventsToICal(...)` — writes `fam_events.json` and `calendar_<year>.ics`.
5. Loops months `1..monthCount`, calls `genCalendar` per month, writes
   `calendar_<year>_<month>.html`.
6. Writes `holidayevents.json` (debug dump of all holiday events seen).
7. `createExtraImageFiles(...)` — creates placeholder images referenced by the HTML.

### `genCalendar(year, month, familyData, extraImageFiles, extraEvents)` — one month
1. `createEvents(year, month)` — Hebcal calendar events (see below).
2. Appends the hard-coded **Rachel Imeinu yahrzeit** `MyEvent`, plus any
   `extraEvents` passed in (currently the clock-change events, see §3a). The
   `extraEvents` array is generic — future custom events can be added to it too.
3. Attaches `e.config = getEventConfig(e)` to every event.
4. `genWeeks(year, month)` builds the grid of `Day` objects.
5. `genMonthHtml(...)` renders and returns the HTML string.

### 3a. Clock changes / extra events — `clockchanges.js` + `clock_changes.csv`
- `genYear` calls `getClockChangeEvents(year)` **once per year** and passes the
  result down to each `genCalendar` call as `extraEvents`.
- `clock_changes.csv` columns: `HebrewYear,Season,Year,Month,Date`.
  - `Season` = `Winter` or `Summer`.
  - `Year/Month/Date` is the Gregorian date; **Month is 1-based** (10 = October).
- `getClockChangeEvents(hebrewYear)` filters rows for that Hebrew year and builds
  a `MyEvent` for each season (`שעון חורף` / `שעון קיץ`).
- Missing season row → `console.warn` and skip that season; missing/unreadable
  CSV → `console.warn` and return `[]`. Generation always continues.
- `MyEvent` lives in **`myevent.js`** (imported by both `gen.js` and
  `clockchanges.js`; re-exported from `gen.js`).

### Event sources — `createEvents` / `cityEvents`
- `cityEvents` calls `HebCal.HebrewCalendar.calendar()` with candle-lighting,
  sedrot, omer, dafyomi, `il: true`.
- `createEvents` = Jerusalem (all events) + Tel Aviv & Haifa (time-only, for
  candle-lighting/havdalah times).

### `MyEvent` class
Custom event with `date` (HDate), `desc`, `basename`, `hebrewname`, and a
`myevent` marker property used by `getEventConfig` to style it.

### `Day` class
Wraps a Hebcal `HDate`. Key members:
- Private `#month/#date/#year/#primaryMonth`.
- `isActiveMonth` — true when the day belongs to the month being rendered
  (vs. spillover days from prev/next month shown greyed).
- `hebrewDate` — day-of-month as gematriya (via `HebUtils`).
- `fullEnglishDate` / `fullHebrewDate`, `dayOfWeek`, `englishDate`.
- `isSameHebrewDate(month, date)` — used to match family records to a day.

### Grid building — `genWeeks` / `genDaysOfWeek`
Builds weeks (arrays of 7 `Day`s) covering the month, padding the first week
with trailing days of the previous month and overflow into the next month.
`monthConfig` carries `daysInMonth`, `daysInPrev`, prev month/year, etc.

> Dead/legacy code: `genMonth(year, month)` (lines ~138–162) is broken/unused.

### iCal — `addEventsToICal`
Builds an `ical-generator` calendar named `סיירת טרגין - <year>`. For each family
event, converts the HDate to a UTC all-day date and creates an event summarized
as `"<type>: <name1> ו<name2>"`. Writes `calendar_<year>.ics`.

---

## 4. HTML rendering — `htmlbuilder.js`

Default export `genMonthHtml(cfg, weeks, events, familyData, extraImageFiles)`.

- Emits an HTML doc linking `calendar.css` and a `<table class="calendar">`.
- `genTitleHTML` — month header (Hebrew month name in Hebrew + Gregorian span).
- `genDayRow` — Hebrew weekday headers (`DaysOfWeek`).
- `genWeekHTML` — one `<tr>` per week; for each `Day`:
  - **Active month day** → `genDayHTML` (filters events/family to that date via
    `isSameDate` / `isSameHebrewDate`).
  - **Other-month day** → `genOtherMonthDay` (placeholder filler image
    `othermonths/<Month><Pre|Post><n>.png`).
- `genDayHTML` layout: title row (heb date, in-title events, eng date), main body
  (birthdays, anniversaries, yahrzeits, event placeholder images), footer row
  (omer/dafyomi + candle-lighting times).
- Family rendering helpers: `genBirthdayHTML`, `genAnnivHTML`, `genYahrzeitHTML`
  (each uses `imgs/*.png`).
- `genClassList` — picks CSS day classes by `dayClassPriority`.
- `addImageToList` / `genEventPlaceholders` — accumulate placeholder image paths
  that `createExtraImageFiles` later materializes (copies `imgs/1x1.png`).

> Bug note: `getNumberOfExtraDays` references undefined `d` (unused function).

---

## 5. Event styling config — `definitions.js`

- `getEventConfig(event)` returns a config object driving rendering, keyed off the
  Hebcal event class:
  | Event type | Effect |
  |-----------|--------|
  | Havdalah / CandleLighting | `timeEvent`, display = time string |
  | RoshChodesh | `inTitle`, class `roshchodesh` |
  | HolidayEvent | `inTitle`, class via `getHolidayClass` (major/minor) |
  | ParshaEvent | `inTitle`, class `shabbat`, display = parsha name |
  | OmerEvent | `inFooter` |
  | DafYomiEvent | `inFooter`, display = daf portion |
  | `MyEvent` (`myevent` set) | `inTitle`, class `minorday` |
- `HolidayTypes.Major` / `.Minor` — lists classifying holidays for CSS.
- `HebMonthsEnglishName` — index (month-1) → English month name (Nissan…AdarB).
- `DaysOfWeek` (Hebrew), `Months` (Gregorian abbrev), `IMGDIRS` (image subdirs).
- Language fixed to `LANG = 'he'`.

> Bug note: several `dayClassPriority = ...` assignments are missing `config.`
> (assign to an undeclared global instead of the config object).

---

## 6. Gematriya — `gematriya.js`

`HebUtils.gematriya(num, options)` converts numbers to Hebrew-letter numerals
(with טו/טז special-casing for 15/16, and geresh/gershayim punctuation).
Used for day-of-month display. A large commented-out reference implementation
follows the active one.

---

## 7. Files & directories

| Path | Role |
|------|------|
| `getgoogledata.js` | Download from Sheets + generate (entry) |
| `genlocal.js` | Regenerate from cache (entry) |
| `gen.js` | Core: year/month/week/day + iCal (ESM) |
| `myevent.js` | `MyEvent` class (custom calendar events) |
| `clockchanges.js` | `getClockChangeEvents(hebrewYear)` — reads clock_changes.csv |
| `clock_changes.csv` | Per-year winter/summer clock-change dates |
| `htmlbuilder.js` | HTML table rendering |
| `definitions.js` | Event→style config, holiday lists, month names |
| `gematriya.js` | Number → Hebrew numeral |
| `gen_english.js` | Separate/older English variant (not in main flow) |
| `template/` | `calendar.css` + `imgs/` copied into each output dir |
| `credentials.json` | Google OAuth client secret (installed app) |
| `token.json` | Cached OAuth token (auto-created) |
| `last_data.txt` | Cached spreadsheet data (JSON) — genlocal input |
| `data.json` | Sample/legacy data |
| `holidayevents.json` | Debug dump of holiday events (regenerated) |
| `out/<year>/` | Generated output: HTML pages, `.ics`, images |

**Data record shape** (in `last_data.txt` and passed to `genYear`):
```json
{ "monthName": "Kislev", "date": "22", "type": "Anniversary",
  "name1": "יהונתן חיים", "name2": "רחל חיה" }
```
After `fillIncomingData`, each record also gets numeric `month`.

---

## 8. Running

```bash
# Online: download + generate for a given Hebrew year
node getgoogledata.js 5787

# Offline: regenerate from cache (edit the year in genlocal.js line 23)
node genlocal.js
```
Output lands in `out/<year>/`.

---

## 9. Known rough edges / things to watch when changing code

- **Hard-coded per-year date** in `genCalendar`: Rachel Imeinu (fixed Hebrew
  date, fine). **Clock changes now come from `clock_changes.csv`** — still need a
  row per Hebrew year, but no code edits required; missing rows just warn.
- **CommonJS vs ESM** mix between entry points and core.
- **Leap year / Adar** handling via `combineAdars`; `Adar_II` in data maps to
  month 13 → collapsed to 12 in non-leap years.
- Default year lives in **two places**: `getgoogledata.js` (arg/`5787`) and
  `genlocal.js` (`5786`).
- Several dead functions and `config.`-missing bugs noted inline above.
