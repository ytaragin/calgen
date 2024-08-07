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
const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

function getHolidayClass(e) {
    if (HolidayTypes.Major.includes(e.desc)) {
        return "holiday"
    }
    if (HolidayTypes.Minor.includes(e.desc)) {
        return "minorday"
    }
    if (HolidayTypes.Major.filter(ht => e.desc.startsWith(ht)).length > 0) {
        return "holiday"
    }
    return "minorday"

}

const getEventConfig = (event) => {
    let config = {
        inTitle: false,
        timeEvent: false,
        inFooter: false,
        dayClass: "",
        dayClassPriority: 10,
        genPlaceHolder: false,
        getDisplay: e => e.render(LANG),
    };

    if ((event instanceof HebCal.HavdalahEvent) ||
        (event instanceof HebCal.CandleLightingEvent)) {
        config.timeEvent = true;
        config.getDisplay = e => e.eventTimeStr;
    } else if (event instanceof HebCal.RoshChodeshEvent) {
        config.inTitle = true;
        config.dayClass = "roshchodesh";
        config.genPlaceHolder = true;
        dayClassPriority = 5;
    } else if (event instanceof HebCal.HolidayEvent) {
        config.inTitle = true;
        //        config.dayClass = "holiday";
        config.dayClass = getHolidayClass(event);
        dayClassPriority = 3;
        config.genPlaceHolder = true;
        config.getDisplay = genHolidayDisplay;
    } else if (event instanceof HebCal.ParshaEvent) {
        config.inTitle = true;
        config.dayClass = "shabbat"
        dayClassPriority = 4
        config.genPlaceHolder = true;
        //        config.getDisplay = (e => e.render(LANG).split(' ')[1])
        config.getDisplay = (e => e.render(LANG).match(/[\S]* (.*)/)[1])
    } else if (event instanceof HebCal.OmerEvent) {
        config.inFooter = true;
    } else if (event instanceof HebCal.DafYomiEvent) {
        config.inFooter = true;
        config.getDisplay = e => e.render(LANG).split(':')[1].trim();
    } else if (event.myevent !== undefined) {
        config.inTitle = true;
        //        config.dayClass = "holiday";
        config.dayClass = "minorday";
        dayClassPriority = 3;
        config.genPlaceHolder = true;
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


const HolidayTypes = {
    "Minor": [
        "Asara B'Tevet",
        "Erev Pesach",
        "Erev Purim",
        "Erev Rosh Hashana",
        "Erev Shavuot",
        "Erev Sukkot",
        "Erev Tish'a B'Av",
        "Erev Yom Kippur",
        "Leil Selichot",
        "Lag BaOmer",
        "Pesach Sheni",
        "Purim Katan",
        "Shabbat Chazon",
        "Shabbat HaChodesh",
        "Shabbat HaGadol",
        "Shabbat Nachamu",
        "Shabbat Parah",
        "Shabbat Shekalim",
        "Shabbat Shuva",
        "Shabbat Zachor",
        "Sigd",
        "Ta'anit Bechorot",
        "Ta'anit Esther",
        "Tish'a B'Av (observed)",
        "Tu B'Av",
        "Tu BiShvat",
        "Tzom Gedaliah",
        "Tzom Tammuz",
        "Yom HaAliyah",
        "Yom HaShoah",
        "Yom HaZikaron",
        "Chanukah: 1 Candle",
    ],
    "Major": [
        "Chanukah: 2 Candles",
        "Chanukah: 3 Candles",
        "Chanukah: 4 Candles",
        "Chanukah: 5 Candles",
        "Chanukah: 6 Candles",
        "Chanukah: 7 Candles",
        "Chanukah: 8 Candles",
        "Chanukah: 8th Day",
        "Pesach",
        "Purim",
        "Rosh Chodesh Adar",
        "Rosh Chodesh Adar I",
        "Rosh Chodesh Adar II",
        "Rosh Chodesh Av",
        "Rosh Chodesh Cheshvan",
        "Rosh Chodesh Elul",
        "Rosh Chodesh Iyyar",
        "Rosh Chodesh Kislev",
        "Rosh Chodesh Nisan",
        "Rosh Chodesh Sh'vat",
        "Rosh Chodesh Sivan",
        "Rosh Chodesh Tamuz",
        "Rosh Chodesh Tevet",
        "Rosh Hashana",

        "Shavuot",
        "Shmini Atzeret",
        "Shushan Purim",
        "Sukkot",
        "Yom HaAtzma'ut",
        "Yom Kippur",
        "Yom Yerushalayim"
    ]
}


module.exports = {
    DaysOfWeek,
    Months,
    HebMonthsEnglishName,
    getEventConfig,
    IMGDIRS
}
