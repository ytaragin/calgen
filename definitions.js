let HebCal = require('@hebcal/core');


const DaysOfWeek = [
    'ראשון',
    'שני',
    'שלישי',
    'רביעי',
    'חמישי',
    'ששי',
    'שבת'
    ];
const Months =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

const HebMonthsEnglishName = [ 
    "Nissan", "Iyyar", 
    "Sivan", "Tamuz", 
    "Av", "Elul", 
    "Tishrei", "Chesvan", 
    "Kislev", "Tevet", 
    "Shvat", "AdarA", 
    "AdarB" 
];

const LANG = 'he';

const IMGDIRS = {
    OTHERMONTHS: "othermonths",
    EVENTS: "events",
    IMGS: "imgs",
    PARSHA: "parsha",
    HOLIDAY: "holiday"
}

function genHolidayDisplay(e) {
    let parts = e.render(LANG).split('(');
    return parts.join('<br>(');
}

const getEventConfig = (event) => {
    let config = {
        inTitle: false,
        timeEvent: false,
        inFooter: false,
        dayClass: "",
        genPlaceHolder: false,
        getDisplay: e => e.render(LANG),
    };

    if ((event instanceof HebCal.HavdalahEvent) ||
        (event instanceof HebCal.CandleLightingEvent)) {
        config.timeEvent = true;
        config.getDisplay = e => e.eventTimeStr;
    } else if (event instanceof HebCal.HolidayEvent) {
        config.inTitle = true;
        config.dayClass = "holiday";
        config.genPlaceHolder = true;
        config.getDisplay = genHolidayDisplay;
    } else if (event instanceof HebCal.RoshChodeshEvent) {
        config.inTitle = true;
        config.dayClass = "roshchodesh"
    } else if (event instanceof HebCal.ParshaEvent) {
        config.inTitle = true;
        config.dayClass = "shabbat"
        config.genPlaceHolder = true;
        config.getDisplay = (e => e.render(LANG).split(' ')[1])
    } else if (event instanceof HebCal.OmerEvent) {
        config.inFooter = true;    
    }  else if (event instanceof HebCal.DafYomiEvent) {
        config.inFooter = true;    
        config.getDisplay = e => e.render(LANG).split(':')[1].trim();       
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

module.exports = {
    DaysOfWeek,
    Months,
    HebMonthsEnglishName,
    getEventConfig,
    IMGDIRS,
}
