//let {HebrewCalendar, HDate, Location, Event} = require('@hebcal/core');
let HebCal = require('@hebcal/core');
let {HebUtils} = require('./gematriya.js');

const LANG = 'he';

class Day {
    year;
    month;
    date;
    #dateObj;
    #hebDate;
    isActiveMonth;
    birthdays = [];

    constructor(year, month, date, activeMonth) {
      this.year = year;
      this.month = month;
      this.date = date;
      this.isActiveMonth = activeMonth;
      this.#dateObj = new Date(year, month, date);
      this.#hebDate = new HebCal.HDate(this.#dateObj);

      

    }

    get dayOfWeek() {
        return this.dateObj.getDay();
    }

    get hebrewDate() {
        let hu = new HebUtils();
        return hu.gematriya(this.#hebDate.getDate());
    }

    get fullHebrewDate() {
        return this.#hebDate;
    }
}


// Events

function getEventConfig(event) {
    let config = {
        inTitle: false,
        timeEvent: false, 
        getDisplay: e=>e.render(LANG), 
    };

    if ((event instanceof HebCal.HavdalahEvent) ||
        (event instanceof HebCal.CandleLightingEvent)) {
        config.timeEvent = true;
        config.getDisplay = e=>e.eventTimeStr;
    }  else if (event instanceof HebCal.HolidayEvent) {
        config.inTitle = true;
    }  else if (event instanceof HebCal.RoshChodeshEvent) {
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
    return  `
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


function genDaysOfWeek(year, month, firstdate) {
    let days = [];
    let prevYear = (month > 0) ? year : year-1;
    let prevMonth = (month > 0) ? month-1 : 11;
    let lastDateOfPrev = new Date(prevYear, prevMonth+1, 0).getDate();
    let lastDateOfCurrentMonth = new Date(year, month+1, 0).getDate();
    

    let firstDayOfCurrentWeek = new Date(year, month, firstdate).getDay();
    for (let i=0; i<firstDayOfCurrentWeek; i++) {
        days.push(new Day(prevYear, prevMonth, lastDateOfPrev - (firstDayOfCurrentWeek-i-1), false));
    } 

    let currDate = firstdate;
    let overFlow = 1;
    while (days.length < 7)  {
        if (currDate <= lastDateOfCurrentMonth) {
        days.push( new Day(year, month, currDate++, true));
        } else {
            days.push(new Day(year, month+1,overFlow++, false) );
        }

    }
    days[3].birthdays.push({name: "ישראל ישראלי"});
    days[5].birthdays.push({name: "ישראלה ישראלי"});


    
    return {maxDate:currDate, days};
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

function getEventGroup(events, itemClass, groupClass, attrFilter ){
    let items = events
                .filter(e => attrFilter(getEventConfig(e)))
                .map(e => `
                    <div class="${itemClass}">${getEventConfig(e).getDisplay(e)}</div>
                `)
                .join(''); 
    
    return `<div class="${groupClass}">${items}</div>`;            

}

function getDayTitle(events) {
    let titles = events
                .filter(e => getEventConfig(e).inTitle)
                .map(e => `
                    <div class="day-title">${e.render(LANG)}</div>
                `)
                .join(''); 
    
    return `<div class="day-title-group">${titles}</div>`;            
}

function genDayHTML(day, events) {

    let html = `
    <td class="day-td"><div class="day-cell">

        <div class="title-row ">
            <span class="heb-date">${day.hebrewDate} </span> 
            ${getEventGroup(events, 
                           "day-title", 
                           "day-title-group", 
                           e=>e.inTitle  )}
            <span class="eng-date">${day.date}</span>
        </div>`;
    //html += getDayTitle(events);
    day.birthdays.forEach( b => {
        html += ` 
            <div class="birthday">${b.name}</div>
        `;
    });

    html += getEventGroup(events, "time-item", "time-group",
                         e=>e.timeEvent );

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

    days.forEach(d=> {
        if (d.isActiveMonth) {
            let daysEvents = events.filter(e => d.fullHebrewDate.isSameDate(e.date));
            html += genDayHTML(d, daysEvents);
        } else {

            html +=  '<td id="prevmonthdates">' + 
            '<span id="cellvaluespan">' + (d.date) + '</span><br/>' + 
            '<ul id="cellvaluelist"><li>apples</li><li>bananas</li><li>pineapples</li></ul>' + 
          '</td>';
        }
    })

    html += '</tr>';

    return html;
}

// Show month (year, month)
function genMonth(y,m) {
    let DaysOfWeek = [
        'SUN',
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
        'SAT'
        ];
    let Months =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
    
    let Format = 'dd/mm/yyyy';
    let f = 'M';
  
   CurrentYear = y;
  
    CurrentMonth = m ;
  
  
    // 1st day of the selected month
    let firstDayOfCurrentMonth = new Date(y, m, 1).getDay();
  
    // Last date of the selected month
    let lastDateOfCurrentMonth = new Date(y, m+1, 0).getDate();

    let events = createEvents(y,m+1);

  
    let html = '<table class="calendar">';
  
    html += genDayRow(DaysOfWeek);
        
    let currDate = 1;
    while(currDate < lastDateOfCurrentMonth) {
        let {maxDate, days} = genDaysOfWeek(CurrentYear, CurrentMonth, currDate);
        html += genWeekHTML(days, events);
        currDate = maxDate;
    }
  
     

    
    // Closes table
    html += '</table>';
  

    return html;
};

function createEvents(year, month) {
    const options = {
        year: year,
        isHebrewYear: false,
        candlelighting: true,
        location: HebCal.Location.lookup('Jerusalem'),
        il: true,
        sedrot: true,
        omer: true,
        //locale: 'he',
        month: month,
      };
      const events = HebCal.HebrewCalendar.calendar(options);
      return events;
      
}

function genCalendar() {
 

    let h = startHTML();

    let body = genMonth(2020, 11);


    let end = endHTML();

    console.log(h);
    console.log(body);
    console.log(end);

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


genCalendar();