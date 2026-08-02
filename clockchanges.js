import HebCal from '@hebcal/core';
import fs from 'fs';
import { MyEvent } from './myevent.js';

const CLOCK_CHANGES_FILE = 'clock_changes.csv';

const SEASONS = {
    Winter: { desc: "Winter Time", hebrewName: "שעון חורף" },
    Summer: { desc: "Summer Time", hebrewName: "שעון קיץ" },
};

/**
 * Parse the clock_changes.csv file into an array of row objects.
 * Returns [] (with a warning) if the file cannot be read.
 */
function parseClockChangesFile() {
    let content;
    try {
        content = fs.readFileSync(CLOCK_CHANGES_FILE, 'utf8');
    } catch (err) {
        console.warn(`Warning: could not read ${CLOCK_CHANGES_FILE}; skipping clock change events.`);
        return [];
    }

    let lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length <= 1) {
        return [];
    }

    // Skip header row.
    return lines.slice(1).map(line => {
        let [hebrewYear, season, year, month, date] = line.split(',').map(c => c.trim());
        return {
            hebrewYear: parseInt(hebrewYear, 10),
            season,
            year: parseInt(year, 10),
            month: parseInt(month, 10),
            date: parseInt(date, 10),
        };
    });
}

/**
 * Return the clock-change MyEvents (winter and/or summer) for a given Hebrew year.
 * Missing rows produce a warning and are skipped; generation continues.
 * @param {number} hebrewYear The Hebrew year being generated.
 * @returns {MyEvent[]}
 */
function getClockChangeEvents(hebrewYear) {
    let rows = parseClockChangesFile();
    let events = [];

    for (let season of Object.keys(SEASONS)) {
        let row = rows.find(r => r.hebrewYear === hebrewYear && r.season === season);
        if (!row) {
            console.warn(`Warning: no ${season} clock change found for Hebrew year ${hebrewYear} in ${CLOCK_CHANGES_FILE}.`);
            continue;
        }

        // CSV month is 1-based; JS Date month is 0-based.
        let gregDate = new Date(row.year, row.month - 1, row.date);
        let cfg = SEASONS[season];
        events.push(new MyEvent(new HebCal.HDate(gregDate), cfg.desc, cfg.desc, cfg.hebrewName));
    }

    return events;
}

export { getClockChangeEvents };
