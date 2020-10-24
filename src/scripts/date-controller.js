export class DateController {
    constructor(dateStart, dateEnd) {
        this._configureDate(dateStart);
        this._configureDate(dateEnd);
    }

    _configureDate(date) {
        let time = new Date();
        date.max = time.toLocaleDateString().replaceAll(".", "-");
        date.min = new Date(time.getFullYear() - 1, time.getMonth(), time.getDate()).toLocaleDateString().replaceAll(".", "-");
    }

    checkDates(dateStart, dateEnd) {
        let now = new Date();
        let prev = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        console.log(dateEnd <= now && dateEnd > prev)
        console.log(dateStart <= now && dateStart > prev)
        console.log(dateEnd.getFullYear() - dateStart.getFullYear() <= 1 && dateEnd > dateStart)

        return (dateEnd <= now && dateEnd > prev) && (dateStart <= now && dateStart > prev) &&
            (dateEnd.getFullYear() - dateStart.getFullYear() <= 1 && dateEnd > dateStart);
    }

    _isEqualDate(date1, date2) {
        return date1.toLocaleDateString() === date2.toLocaleDateString();
    }

    _generateDateSet(dateStart, dateEnd) {
        let dates = [];
        for (let i = 0; ; i++) {
            let date = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate() + i);
            dates.push(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`)

            if (this._isEqualDate(date, dateEnd))
                break;
        }

        return {
            labels: dates,
            start: dateStart,
            end: dateEnd
        };
    }

    getDateSet(dateStart, dateEnd) {
        if (this.checkDates(dateStart, dateEnd))
            return this._generateDateSet(dateStart, dateEnd);
        else
            return this.getDefaultSet();
    }

    getDefaultSet(offset = 30) {
        let dateEnd = new Date();
        let dateStart = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate() - offset);
        return this._generateDateSet(dateStart, dateEnd);
    }

    getWeekSet() {
        return this.getDefaultSet(6);
    }
}