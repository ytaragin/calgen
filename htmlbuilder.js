let { DaysOfWeek, Months, getEventConfig } = require('./definitions.js');
let HebCal = require('@hebcal/core');
let { HebUtils } = require('./gematriya.js');
let _ = require('lodash');
const { isElement, divide } = require('lodash');


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
        .filter(e => attrFilter(e.config))
        .map(e => `
                <div class="${itemClass}">${e.config.getDisplay(e)}</div>
            `)
        .join('');

    return `<div class="${groupClass}">${items}</div>`;

}

function genYahrzeitHTML(y) {
    return `<img class="yahrzeit-img"  src="candle.png"><span class="yahrzeit-name">${y.name1}</span>`;
}

function genBirthdayHTML(b) {
    return `<img class="birthday-img"  src="birthday.png"><span class="birthday-name">${b.name1}</span>`;
}

function genAnnivHTML(a) {
    return `<div class="anniv-img"><img class="anniv-img"  src="balloon.jpg"></div>
            <div class="anniv-name"><div>${a.name1}</div><div>ו${a.name2}</div></div>`;
}

function genGroupHTML(items, itemClass, groupClass, transform, type) {
    let itemTypes = items.filter (i => i.type === type);
    let html = `<div class="${groupClass}">`;
    html += itemTypes.map(i => `<div class="${itemClass}">${transform(i)}</div>`).join('');
    html += '</div>'

    return html;
}

function genClassList(events) {
    let classes = _.uniq(events.map(e => e.config.dayClass)).join(" ");
    if (classes === "") {
        classes = "plain-day"
    }

    return classes;
}



function genDayHTML(day, events, familyData) {


    let html = `
<td class="day-td ${genClassList(events)}"><div class="day-cell">

<div class="title-row ">
    <div class="heb-date">${day.hebrewDate} </div> 
    ${getEventGroup(events,
        "day-title",
        "day-title-group",
        e => e.inTitle)}
    <div class="eng-date">${day.englishDate}</div>
</div>`;
    //html += getDayTitle(events);

    html += genGroupHTML(familyData, "birthday",
        "birthday-group", genBirthdayHTML, "Birthday");

    html += genGroupHTML(familyData, "anniv",
        "anniv-group", genAnnivHTML, "Anniversary");

    html += genGroupHTML(familyData, "yahrzeit",
        "yahrzeit-group", genYahrzeitHTML, "Yahrzeit");


    html += '<div class="footer-row ">';
    html += getEventGroup(events, "footer-item", "footer-group",
        e => e.inFooter);
    html += getEventGroup(events, "time-item", "time-group",
        e => e.timeEvent);
    html += '</div>';




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


function genWeekHTML(days, events, familyData) {
    let html = "<tr>";

    days.forEach(d => {
        if (d.isActiveMonth) {
            let daysEvents = events.filter(e => d.fullHebrewDate.isSameDate(e.date));
            let daysFamily = familyData.filter(f => d.isSameHebrewDate(f.month, f.date))
            html += genDayHTML(d, daysEvents, daysFamily);
        }
        else {

            html += '<td id="prevmonthdates">' +
                // '<span id="cellvaluespan">' + (d.date) + '</span><br/>' +
                // '<ul id="cellvaluelist"><li>apples</li><li>bananas</li><li>pineapples</li></ul>' +
                '</td>';
        }
    })

    html += '</tr>';

    return html;
}

function getMonthsInfo(cfg) {
    let start = new HebCal.HDate(1, cfg.month, cfg.year);
    let end = new HebCal.HDate(cfg.daysInMonth, cfg.month, cfg.year);



    return {
        eng: _.uniq([start.greg().getMonth(), end.greg().getMonth()]),
        eng_year: start.greg().getFullYear(),
        heb: start.getMonth(),
        heb_hebrew: start.renderGematriya(),
    }
}

function genTitleHTML(cfg) {
    let months = getMonthsInfo(cfg);
    let eng = months.eng.map(m => Months[m]).join('-');
    let html = `<div class="month_header">`;

    
    let name = months.heb_hebrew.substring(months.heb_hebrew.indexOf(' '));

    html += `${name}`
    html+= ` (${months.eng_year} ${eng}) `
    html += `</div>`;

    return html;
}

function genMonthHtml(cfg, weeks, events, familyData) {


    let h = startHTML();




    let end = endHTML();




    let html = '<table class="calendar">';
    html += `<tr><td colspan="7">${genTitleHTML(cfg)}</td></tr>`;

    html += genDayRow(DaysOfWeek);
    weeks.forEach(days => {
        html += genWeekHTML(days, events, familyData);
    });

    // Closes table
    html += '</table></div>';


    return h + html + end;

}

module.exports = genMonthHtml;