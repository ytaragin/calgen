let { DaysOfWeek, Months, getEventConfig, IMGDIRS } = require('./definitions.js');
let HebCal = require('@hebcal/core');
let { HebUtils } = require('./gematriya.js');
let _ = require('lodash');
const { isElement, divide } = require('lodash');
const { lstat } = require('fs-extra');


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

function addImageToList(imageLists, category, image) {
    if (!(category in imageLists)) {
        imageLists[category] = [];
    }

    imageLists[category].push(image);
}


function genDayRow(daysOfWeek) {
    // Write the header of the days of the week
    let html = '<tr>';
    daysOfWeek.forEach(d => {
        html += `<th class="daysheader">${d}</th>`;
    });

    html += '</tr>\n';

    return html;
}

function getEventGroup(events, itemClass, groupClass, attrFilter) {
    let items = events
        .filter(e => attrFilter(e.config))
        .map(e => `
                <div class="${itemClass}">${e.config.getDisplay(e)}</div>
            `)
        .join('');

    return `<div class="${groupClass}">${items}</div>\n`;

}

function genYahrzeitHTML(y) {
    return `<img class="yahrzeit-img"  src="imgs/candle.png"><span class="yahrzeit-name">${y.name1}</span>`;
}

function genBirthdayHTML(b) {
    return `<img class="birthday-img"  src="imgs/birthday.png"><span class="birthday-name">${b.name1}</span>`;
}

function genAnnivHTML(a) {
    return `<div class="anniv-img"><img class="anniv-img"  src="imgs/balloon.jpg"></div>
            <div class="anniv-name"><div>${a.name1}</div><div>ו${a.name2}</div></div>`;
}

function genGroupHTML(items, itemClass, groupClass, transform, type) {
    let itemTypes = items.filter(i => i.type === type);

    if (itemTypes.length == 0) {
        return "";
    }

    let html = `<div class="${groupClass}">`;
    html += itemTypes.map(i => `<div class="${itemClass}">${transform(i)}</div>`).join('');
    html += '</div>\n'

    return html;
}

function genClassList(events) {
    let classList = _.sortBy(events, "dayClassPriority").reverse().map(e => e.config.dayClass);
    //    let classes = _.uniq(events.map(e => e.config.dayClass)).join(" ");
    let classes = _.uniq(classList).join(" ");
    if (classes === "") {
        classes = "plain-day"
    }

    return classes;
}

function genEventPlaceholders(events, imageLists) {
    let html = "";

    let filtered = events.filter(e => e.config.genPlaceHolder);
    if (filtered.length == 0) {
        return html;
    }

    //    let filename = 

    filtered.forEach(e => {
        let name = e.desc.split('(')[0].trim();
        name = name.replace(/:/g, '');

        let imgfile = `${IMGDIRS.EVENTS}/${name}.png`;
        html += `<div class="event-img-block"><img class="event-img" src="${imgfile}"></div>\n`;
        addImageToList(imageLists, IMGDIRS.EVENTS, imgfile);
    });


    return `<div class="event-placeholders">${html}</div>\n`;


}

function genDayHTML(day, events, familyData, imageLists) {

    let engDateStyle = "eng-date"
    if (day.englishDate == 1) {
        engDateStyle += " eng-date-one"
    }

    let html = `
<td class="day-td ${genClassList(events)}"><div class="day-cell">

<div class="title-row ">
    <div class="heb-date">${day.hebrewDate} </div> 
    ${getEventGroup(events,
        "day-title",
        "day-title-group",
        e => e.inTitle)}
    <div class="${engDateStyle}">${day.englishDate}</div>
</div>
<div class="main-body">
`;
    //html += getDayTitle(events);

    html += genGroupHTML(familyData, "birthday",
        "birthday-group", genBirthdayHTML, "Birthday");

    html += genGroupHTML(familyData, "anniv",
        "anniv-group", genAnnivHTML, "Anniversary");

    html += genGroupHTML(familyData, "yahrzeit",
        "yahrzeit-group", genYahrzeitHTML, "Yahrzeit");

    html += genEventPlaceholders(events, imageLists);

    //<div class="event-img-block"><img class="event-img" src="othermonths/AvPre1.png"></div>

    html += "</div>\n";
    html += '<div class="footer-row ">';
    html += getEventGroup(events, "footer-item", "footer-group",
        e => e.inFooter);
    html += getEventGroup(events, "time-item", "time-group",
        e => e.timeEvent);
    html += '</div>\n';

    html += `        
    </div></td>

`;

    return html;
}

function genOtherMonthDay(day, label, counter, imageLists) {
    let html = '<td class="othermonthdate">'

    let imgfile = `${IMGDIRS.OTHERMONTHS}/${day.primaryMonthInEnglish}${label}${counter}.png`;

    html += `<div class="othermonthimg"><img class="fillerimg" src="${imgfile}"></div>\n`

    addImageToList(imageLists, IMGDIRS.OTHERMONTHS, imgfile);

    html += '</td>\n';

    return html;
}


function genWeekHTML(days, events, familyData, imageLists) {
    let html = "<tr>";

    let label = "Pre";
    let counter = 1;

    days.forEach(d => {
        if (d.isActiveMonth) {
            let daysEvents = events.filter(e => d.fullHebrewDate.isSameDate(e.date));
            let daysFamily = familyData.filter(f => d.isSameHebrewDate(f.month, f.date))
            html += genDayHTML(d, daysEvents, daysFamily, imageLists);
            // if we have a real date then any later blank days will be post days
            label = "Post";
        }
        else {

            html += genOtherMonthDay(d, label, counter++, imageLists);
        }
    })

    html += '</tr>\n';

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
    html += '<div class="month_header_hebrew">';
    html += `${name}`;
    html += `</div>`;
    html += '<div class="month_header_english">';
    html += `${months.eng_year} ${eng}`
    html += `</div>`;
    html += `</div>`;

    return html;
}

function getNumberOfExtraDays(weeks) {
    let count = 0
    weeks.forEach(days => {
        days.forEach(day => {
            if (!d.isActiveMonth) {
                count++;
            }
        })
    });

    return count;
}


function genMonthHtml(cfg, weeks, events, familyData, extraImageFiles) {


    let h = startHTML();




    let end = endHTML();



    let html = '<table class="calendar">';
    html += `<tr><td colspan="7">${genTitleHTML(cfg)}</td></tr>\n`;

    html += genDayRow(DaysOfWeek);
    weeks.forEach(days => {
        html += genWeekHTML(days, events, familyData, extraImageFiles);
    });

    // Closes table
    html += '</table></div>';


    return h + html + end;

}

module.exports = genMonthHtml;