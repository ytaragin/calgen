let { DaysOfWeek, Months } = require('./definitions.js');
let HebCal = require('@hebcal/core');
let { HebUtils } = require('./gematriya.js');
let _ = require('lodash');

const LANG = 'he';


function getEventConfig(event) {
    let config = {
        inTitle: false,
        timeEvent: false,
        getDisplay: e => e.render(LANG),
    };

    if ((event instanceof HebCal.HavdalahEvent) ||
        (event instanceof HebCal.CandleLightingEvent)) {
        config.timeEvent = true;
        config.getDisplay = e => e.eventTimeStr;
    } else if (event instanceof HebCal.HolidayEvent) {
        config.inTitle = true;
    } else if (event instanceof HebCal.RoshChodeshEvent) {
        config.inTitle = true;
    }
    /*
    else if (event instanceof HebCal.OmerEvent) {
        custom = {
        }
    }  else if (event instanceof HebCal.Sedra) {
        return {
            inTitle: false,
            timeEvent: false,  
            getDisplay: e=>e.render(LANG), 
        }
    }  else if (event instanceof HebCal.DafYomi) {
        return {
            inTitle: false,
            timeEvent: false,  
            getDisplay: e=>e.render(LANG), 
        }
    }  else if (event instanceof HebCal.MevarchimChodeshEvent) {
        return {
            inTitle: false,
            timeEvent: false,  
            getDisplay: e=>e.render(LANG), 
        }
    } else {
        return {
            inTitle: false,
            timeEvent: false, 
            getDisplay: e=>e.render(LANG), 
        }
    }
    */

    return config;

}

function startHTML() {
    return `
<HTML>
<HEAD>
<title>Calendar Month</title>
<meta charset="UTF-8">
  <link rel="stylesheet"  href="calendar.css" />
<BODY>

    
    `;
}

function endHTML() {
    return `
</BODY>
</HTML>
    `;
}


function genDayRow(daysOfWeek) {
    // Write the header of the days of the week
    let html = '<tr>';
    daysOfWeek.forEach(d => {
        html += `<th class="daysheader">${d}</th>`;
    });

    html += '</tr>';

    return html;
}

function getEventGroup(events, itemClass, groupClass, attrFilter) {
    let items = events
        .filter(e => attrFilter(getEventConfig(e)))
        .map(e => `
                <div class="${itemClass}">${getEventConfig(e).getDisplay(e)}</div>
            `)
        .join('');

    return `<div class="${groupClass}">${items}</div>`;

}


function genDayHTML(day, events) {

    let html = `
<td class="day-td"><div class="day-cell">

<div class="title-row ">
    <span class="heb-date">${day.hebrewDate} </span> 
    ${getEventGroup(events,
        "day-title",
        "day-title-group",
        e => e.inTitle)}
    <span class="eng-date">${day.englishDate}</span>
</div>`;
    //html += getDayTitle(events);
    day.birthdays.forEach(b => {
        html += ` <div class="birthday">${b.name}</div>`;
    });

    html += getEventGroup(events, "time-item", "time-group",
        e => e.timeEvent);

    /*    
    events.forEach(e => {
        html += `<div class="event">${e.render('he')}</div>`
    });
    */
    html += `        
    </div></td>

`;

    return html;
}


function genWeekHTML(days, events) {
    let html = "<tr>";

    days.forEach(d => {
        if (d.isActiveMonth) {
            let daysEvents = events.filter(e => d.fullHebrewDate.isSameDate(e.date));
            html += genDayHTML(d, daysEvents);
        } else {

            html += '<td id="prevmonthdates">' +
                '<span id="cellvaluespan">' + (d.date) + '</span><br/>' +
                '<ul id="cellvaluelist"><li>apples</li><li>bananas</li><li>pineapples</li></ul>' +
                '</td>';
        }
    })

    html += '</tr>';

    return html;
}

function getMonthsInfo(cfg) {
    let start = new HebCal.HDate(1, cfg.month, cfg.year); 
    let end = new HebCal.HDate(cfg.daysInMonth, cfg.month, cfg.year );

    

    return {
        eng: _.uniq([start.greg().getMonth(), end.greg().getMonth()]),
        eng_year: start.greg().getFullYear(),
        heb: start.getMonth(),
        heb_hebrew: start.renderGematriya(),
    }
}

function genMonthHtml(cfg, weeks, events) {


    let h = startHTML();




    let end = endHTML();


    let months = getMonthsInfo(cfg);
    let eng = months.eng.map(m => Months[m]).join('-')

    let html = `<div class="month_header">(${months.eng_year} ${eng}) ${cfg.year} ${months.heb} ${months.heb_hebrew}</div><table class="calendar">`;

    html += genDayRow(DaysOfWeek);
    weeks.forEach(days => {
        html += genWeekHTML(days, events);
    });

    // Closes table
    html += '</table>';


    return h + html + end;

}

module.exports = genMonthHtml;