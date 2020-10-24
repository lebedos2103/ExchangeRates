export class Exchanger {
    uri = 'https://www.nbrb.by/API/';
    cors = 'https://cors-anywhere.herokuapp.com/';
    async getCurrenciesNames() {
        let response = await fetch(this.uri + 'ExRates/Rates?Periodicity=0');
        if (response.ok){
            let currencies = await response.json();
            return currencies.map(currency => {
                return {
                    id: currency.Cur_ID,
                    name: currency.Cur_Name,
                    code: currency.Cur_Abbreviation,
                    selected: false
                }
            })
        }
    }

    async getRatesToday(){
        let response = await fetch( this.uri + 'ExRates/Rates?Periodicity=0');
        if (response.ok){
            let rates = await response.json();
            return rates;
        }
    }

    async getRateById(id) {
        let response = await fetch( `${this.uri}ExRates/Rates/${id}?Periodicity=0`);
        if (response.ok){
            let rate = await response.json();
            return rate;
        }
        else {
            throw new Error("Данного курса не существует");
        }
    }

    async getRatePeriod(id, dateStart, dateEnd) {
        let response = await fetch( `${this.uri}ExRates/Rates/Dynamics/${id}?startDate=${dateStart.toUTCString()}&endDate=${dateEnd.toUTCString()}`);
        if (response.ok){
            let rates = await response.json();
            return rates.map(rate => rate.Cur_OfficialRate)
        }
        else {
            throw new Error("Данного курса не существует");
        }
    }
}