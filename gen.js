let {HebrewCalendar, HDate, Location, Event} = require('@hebcal/core');
let {HebUtils} = require('./gematriya.js');


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
      this.#hebDate = new HDate(this.#dateObj);

      

    }

    get dayOfWeek() {
        return this.dateObj.getDay();
    }

    get hebrewDate() {
        let hu = new HebUtils();
        return hu.gematriya(this.#hebDate.getDate());
    }
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
    days[5].birthdays.push({name: "ישראל ישראלי"});


    
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


function genDayHTML(day) {
    let xhtml = `
        <td class="day-cell" id="currentmonthdates">
            <table class="date-row"><tr>
            <td class="eng-date"> ${day.date} </td>
            <td class="heb-date"> ${day.hebrewDate} </td>
            </tr>
            </table>
            `;
    let html = `
    <td class="day-cell" id="currentmonthdates">

                  <div class="day_number_row">
                  <span class="heb-date">${day.hebrewDate} </span> 
                  <span class="eng-date">${day.date}</span>
                  </div>`;
    day.birthdays.forEach( b => {
        html += ` 
            <div class="birthday">${b.name}</div>
        `;
    })        

    html += `        
        </td>
    
    `;

    return html;
}


function genWeekHTML(days) {
    let html = "<tr>";

    days.forEach(d=> {
        if (d.isActiveMonth) {
            html += genDayHTML(d);
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
  
    // Last day of the previous month
    let lastDateOfLastMonth = m == 0 ? new Date(y-1, 11, 0).getDate() : new Date(y, m, 0).getDate();



  
    // Write selected month and year. This HTML goes into <div id="month"></div>
    let monthandyearhtml = '<span id="monthandyearspan">' + Months[m] + ' - ' + y + '</span>';
  
    let html = '<table>';
  
    html += genDayRow(DaysOfWeek);

        
    let currDate = 1;
    while(currDate < lastDateOfCurrentMonth) {
        let {maxDate, days} = genDaysOfWeek(CurrentYear, CurrentMonth, currDate);
        html += genWeekHTML(days);
        currDate = maxDate;
    }
  
     

    
    // Closes table
    html += '</table>';
  

    return html;
};



function genCalendar() {
    let h = startHTML();

    let body = genMonth(2021, 4);


    let end = endHTML();

    console.log(h);
    console.log(body);
    console.log(end);

    // let hd = new HDate(new Date(2020, 11, 27));
    // console.log(hd);
    // console.log(hd.render());
    // console.log(hd.renderGematriya());
    // hu = new HebUtils();
    // console.log(hu.gematriya(15));

}


genCalendar();