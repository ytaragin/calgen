class MyEvent {
    constructor(date, desc, basename, hebrewname) {
        this.date = date;
        this.desc = desc;
        this.basename = basename;
        this.hebrewname = hebrewname;
        this.myevent = "myevent";
    }

    basename() {
        return this.getDesc();
    }
    getDesc() {
        return this.desc;
    }
    getDate() {
        return this.date;  //HDate
    }
    render(locale) {
        return this.hebrewname;
        //return Locale.gettext(this.desc, locale);
    }
}

export { MyEvent };
