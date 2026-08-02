//let {HebrewCalendar, HDate, Location, Event} = require('@hebcal/core');
import HebCal from '@hebcal/core';
import { HebUtils } from './gematriya.js';
import genMonthHtml from './htmlbuilder.js';
import { getEventConfig, HebMonthsEnglishName, IMGDIRS } from './definitions.js';
import { MyEvent } from './myevent.js';
import { getClockChangeEvents } from './clockchanges.js';
import fse from 'fs-extra';
import ical from 'ical-generator';




class Day {
    #year;
    #month;
    #date;
    #dateObj;
    #hebDate;
    #primaryMonth;
    //isActiveMonth;
    birthdays = [];
    anniversaries = [];
    yahrtzeits = [];

    constructor(year, month, date, primaryMonth) {
        this.#year = year;
        this.#month = month;
        this.#date = date;
        this.#primaryMonth = primaryMonth;
        this.#hebDate = new HebCal.HDate(date, month, year);
        this.#dateObj = this.#hebDate.greg();

    }

    get isActiveMonth() {
        return (this.#month == this.#primaryMonth);
    }

    get englishDate() {
        return this.#dateObj.getDate();
    }

    get dayOfWeek() {
        return this.#dateObj.getDay();
    }

    get hebrewDate() {
        let hu = new HebUtils();
        return hu.gematriya(this.#hebDate.getDate());
    }

    get hebrewMonthInEnglish() {
        return HebMonthsEnglishName[this.#month - 1];
    }

    get primaryMonthInEnglish() {
        return HebMonthsEnglishName[this.#primaryMonth - 1];
    }


    get fullHebrewDate() {
        return this.#hebDate;
    }

    get fullEnglishDate() {
        return this.#dateObj;
    }

    isSameHebrewDate(month, date) {
        return (this.#month == month) && (this.#date == date);
    }
}


// Events



function genDaysOfWeek(monthConfig, firstDate) {
    // let firstDayOfCurrentWeek = new Date(year, month, firstdate).getDay();
    let firstDayOfCurrentWeek = new HebCal.HDate(firstDate, monthConfig.month, monthConfig.year).getDay();
    let days = [];

    for (let i = 0; i < firstDayOfCurrentWeek; i++) {
        days.push(new Day(monthConfig.prevYear, monthConfig.prevMonth,
            monthConfig.daysInPrev - (firstDayOfCurrentWeek - i - 1), monthConfig.month));
    }

    let currDate = firstDate;
    let overFlow = 1;
    while (days.length < 7) {
        if (currDate <= monthConfig.daysInMonth) {
            days.push(new Day(monthConfig.year, monthConfig.month, currDate++, monthConfig.month));
        } else {
            days.push(new Day(monthConfig.year, monthConfig.month + 1, overFlow++, monthConfig.month));
        }

    }



    return { maxDate: currDate, days };
}

function genWeeks(year, month) {
    let prevYear = (month > 0) ? year : year - 1;
    let prevMonth = (month > 0) ? month - 1 : 11;
    let monthConfig = {
        year,
        month,
        prevYear,
        prevMonth,
        prevYear: (month > 0) ? year : year - 1,
        prevMonth: (month > 0) ? month - 1 : 11,
        daysInMonth: HebCal.HDate.daysInMonth(month, year),
        daysInPrev: HebCal.HDate.daysInMonth(prevMonth, prevYear),
    };

    let weeks = [];

    let currDate = 1;
    while (currDate <= monthConfig.daysInMonth) {
        let { maxDate, days } = genDaysOfWeek(monthConfig, currDate);
        weeks.push(days);
        currDate = maxDate;
    }
    /*
        weeks[1][3].birthdays.push({name: "ישראל ישראלי"});
        weeks[2][5].anniversaries.push({names: ["אברהם אבינו", "שרה אימנו" ]});
        weeks[2][5].anniversaries.push({names: ["יצחק אבינו", "רבקה אימנו" ]});
    */

    return { weeks, monthConfig };
}



// Show month (year, month)
function genMonth(year, month) {


    let currDate = 1;
    while (currDate < lastDateOfCurrentMonth) {
        let { maxDate, days } = genDaysOfWeek(year, month, currDate);
        html += genWeekHTML(days, events);
        currDate = maxDate;
    }




    // 1st day of the selected month
    let firstDayOfCurrentMonth = new Date(y, m, 1).getDay();

    // Last date of the selected month
    let lastDateOfCurrentMonth = new Date(y, m + 1, 0).getDate();

    let events = createEvents(year, month);


    genMonthHtml(year, month)

};

function cityEvents(year, month, city, timeOnly) {
    const options = {
        year: year,
        isHebrewYear: true,
        candlelighting: true,
        location: HebCal.Location.lookup(city),
        il: true,
        sedrot: true,
        omer: true,
        dafyomi: true,
        //locale: 'he',
        month: month,
    };
    let events = HebCal.HebrewCalendar.calendar(options);

    if (timeOnly) {
        events = events.filter(e => getEventConfig(e).timeEvent);
    }

    // events.forEach(e => e.config = getEventConfig(e));

    return events;

}

function createEvents(year, month) {

    let events = cityEvents(year, month, "Jerusalem", false);
    events = events.concat(cityEvents(year, month, "Tel Aviv", true));
    events = events.concat(cityEvents(year, month, "Haifa", true));


    return events;

}

function fillIncomingData(data) {
    data.forEach(d => {
        d.month = HebCal.months[d.monthName.toUpperCase()];
    });
}

async function createExtraImageFiles(extraImageFiles, outputDir) {
    for (let key in extraImageFiles) {
        await fse.ensureDir(`${outputDir}/${key}`);
        extraImageFiles[key].forEach(async f => {
            await fse.copy(`${outputDir}/${IMGDIRS.IMGS}/1x1.png`, `${outputDir}/${f}`);
        });
    }
}



let alle = [];

function genCalendar(year, month, familyData, extraImageFiles, extraEvents) {


    console.log(`Generating calendar for ${year}-${month}...`);
    console.log(extraEvents[0]);
    console.log(extraEvents[1]);



    let events = createEvents(year, month);

    events = events.concat([
        new MyEvent(new HebCal.HDate(11, 8, year), "Rachel Imeinu", "Rachel Imeinu", "פטירת רחל אמנו"),
        //new MyEvent(new HebCal.HDate(11, 8, 5785), "Rachel Imeinu", "Rachel Imeinu", "פטירת רחל אמנו"),
        ...extraEvents,
    ]);

    events.forEach(e => e.config = getEventConfig(e));

    events.filter(e => e instanceof HebCal.HolidayEvent).forEach(e => {
        alle.push({
            desc: e.desc,
            mask: e.mask
        });
    });


    let { weeks, monthConfig } = genWeeks(year, month);


    let doc = genMonthHtml(monthConfig, weeks, events, familyData, extraImageFiles);






    //console.log(doc);

    return (doc);

    // let d = new Day(2000, 12, 12, true);
    // console.log(d.constructor);

    // let ev = createEvents(2020, 11);
    // ev.forEach(e => console.log(e.constructor));

    // let hd = new HDate(new Date(2020, 11, 27));
    // console.log(hd);
    // console.log(hd.render());
    // console.log(hd.renderGematriya());
    // hu = new HebUtils();
    // console.log(hu.gematriya(15));


}

function combineAdars(events) {
    events.forEach(e => {
        if (e.month == 13) {
            e.month = 12;
        }
    })
}


function addEventsToICal(outputDir, year, events) {

    let calendar = ical({ name: `סיירת טרגין - ${year}` });
    console.log(calendar.toString());

    // dump all events to a file
    try {
        const eventsJson = JSON.stringify(events, null, 2);
        fse.writeFileSync(`${outputDir}/fam_events.json`, eventsJson);
    } catch (err) {
        console.error(err);
    }

    events.forEach(e => {
        let day = new Day(year, e.month, e.date, true)
        let dt = day.fullEnglishDate;
        let gmtDate = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
        calendar.createEvent({
            start: gmtDate,
            allDay: true,
            categories: [{ name: e.type }],
            summary: `${e.type}: ${e.name1} ${e.name2 ? 'ו' + e.name2 : ''}`,
        });
        // uid: `${e.desc}-${dt.getTime()}@hebcal.com`,
    });
    try {
        fse.writeFileSync(`${outputDir}/calendar_${year}.ics`, calendar.toString());
    } catch (err) {
        console.error(err);
    }


}


async function genYear(year, events) {
    fillIncomingData(events);

    let extraEvents = getClockChangeEvents(year);


    let outputDir = `out/${year}`;

    await fse.copy("template", outputDir);
    let extraImageFiles = {};



    let monthCount = HebCal.HDate.monthsInYear(year);

    if (monthCount < 13) {
        combineAdars(events);
    }

    addEventsToICal(outputDir, year, events);

    for (let i = 1; i <= monthCount; i++) {
        let html = genCalendar(year, i, events, extraImageFiles, extraEvents);
        try {
            fse.writeFileSync(`${outputDir}/calendar_${year}_${i}.html`, html);
        } catch (err) {
            console.error(err);
        }
    }



    let str = JSON.stringify(alle);
    fse.writeFileSync(`holidayevents.json`, str);


    createExtraImageFiles(extraImageFiles, outputDir)

        let hd = new HebCal.HDate(10, 6, 5786);

        let localDate = hd.greg();
        let gmtDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
        console.log(`${hd} - ${localDate} - GMT: ${gmtDate}`);

        let day = new Day(5786, 6, 10, 6);
        console.log(`${day.hebrewDate} - ${day.fullEnglishDate}`);

        // console.log(`${hd} - ${hd.gregEve()}`);


}


//genCalendar(5781, 3);

export {
    genCalendar,
    genYear,
    MyEvent,
}
