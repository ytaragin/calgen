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

const LANG = 'he';



const getEventConfig = (event) => {
    let config = {
        inTitle: false,
        timeEvent: false,
        inFooter: false,
        dayClass: "",
        getDisplay: e => e.render(LANG),
    };

    if ((event instanceof HebCal.HavdalahEvent) ||
        (event instanceof HebCal.CandleLightingEvent)) {
        config.timeEvent = true;
        config.getDisplay = e => e.eventTimeStr;
    } else if (event instanceof HebCal.HolidayEvent) {
        config.inTitle = true;
        config.dayClass = "holiday"
    } else if (event instanceof HebCal.RoshChodeshEvent) {
        config.inTitle = true;
        config.dayClass = "roshchodesh"
    } else if (event instanceof HebCal.ParshaEvent) {
        config.inTitle = true;
        config.dayClass = "shabbat"
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
    getEventConfig,
}
