import { Injectable } from "@angular/core";
import { SQLStorageService } from "./storage.service";
import { UtilService } from "./util.service";
import { BasicService } from "./basic.service";

@Injectable()
export class HistoryService {
    constructor(
        private sqlStorageService: SQLStorageService,
        private utilService: UtilService,
        private basic: BasicService
    ) { }

    addToHistory(currentValue, oldValue, history: any = null, isAuto = false) {
        this.fetchHistory(currentValue.name, (history) => {
            let flag = 0;
            if (currentValue.totalAmount != oldValue.totalAmount) {
                history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Total Amount was ${isAuto ? 'auto updated' : 'changed'} from ${oldValue.totalAmount} to ${currentValue.totalAmount}.`);
                flag = 1;
            }

            if (currentValue.startDate != oldValue.startDate) {
                history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Start Date was changed from ${this.utilService.getDate(oldValue.startDate, true)} to ${this.utilService.getDate(currentValue.startDate, true)}.`);
                flag = 1;
            }

            if (currentValue.maturityDate != oldValue.maturityDate && currentValue.maturityDate && currentValue.maturityDate != 'null') {
                history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Maturity Date was changed from ${oldValue.maturityDate && oldValue.maturityDate !== 'null' ? this.utilService.getDate(oldValue.maturityDate, true) : '-'} to ${this.utilService.getDate(currentValue.maturityDate, true)}.`);
                flag = 1;
            }

            if (currentValue.notes != oldValue.notes) {
                history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Notes were updated.`);
                flag = 1;
            }

            if (currentValue.type != oldValue.type) {
                history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, currentValueestment Type was changed from ${this.utilService.invTypes[oldValue.type]} to ${this.utilService.invTypes[currentValue.type]}.`);
                flag = 1;
            }

            if (currentValue.profit != oldValue.profit) {
                history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Profit Amount was ${isAuto ? 'auto updated' : 'changed'} from ${oldValue.profit} to ${currentValue.profit}.`);
                flag = 1;
            }

            if (currentValue.loss != oldValue.loss) {
                history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Loss Amount was changed from ${oldValue.loss} to ${currentValue.loss}.`);
                flag = 1;
            }

            if (history.history.length > 40) {
                history.history = history.history.slice(0, 40);
                flag = 1;
            }

            if (flag == 1) {
                history.history = encodeURI(JSON.stringify(history.history));
                history.lastModifiedOn = new Date().getTime();

                this.sqlStorageService.updateHistory(history)
                    .then(() => { console.log("History added"); })
                    .catch((err) => { console.log(err); })
            }
        }, history);
    }

    fetchHistory(name, cb, history = null) {
        if (history) {
            cb(history);
        }

        this.sqlStorageService.getHistory(name)
            .then((response) => {
                if (response.rows.length) {
                    let history = response.rows.item(0);
                    history.history = JSON.parse(decodeURI(response.rows.item(0).history));
                    cb(history);
                } else {
                    cb({ history: [], name, lastModifiedOn: new Date().getTime() });
                }
            })
            .catch((err) => {
                cb({ history: [], name, lastModifiedOn: new Date().getTime() });
            })
    }

    addToAutoUpdatesInHistory(name, type, currentValue, oldValue) {
        setTimeout(() => {
            this.fetchHistory(name, (history) => {
                let flag = 0;
                if (currentValue.amount == 0 || currentValue.profit == 0) {
                    history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, periodic ${type == 'addition' ? 'investment' : 'profit increment'} was removed.`);
                    flag = 1;
                } else {
                    if (currentValue.amount != oldValue.amount) {
                        history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, periodic investment amount was changed from ${oldValue.amount || 0} to ${currentValue.amount}.`);
                        flag = 1;
                    }

                    if (currentValue.profit != oldValue.profit) {
                        history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, periodic profit increment amount was changed from ${oldValue.profit || 0} to ${currentValue.profit}.`);
                        flag = 1;
                    }

                    if (currentValue.period != oldValue.period) {
                        history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, periodic ${type == 'addition' ? "investment's" : "profit increment's"} period was changed from ${oldValue.period || 0} month(s) to ${currentValue.period} month(s).`);
                        flag = 1;
                    }

                    if (history.history.length > 40) {
                        history.history = history.history.slice(0, 40);
                        flag = 1;
                    }

                    if (flag == 1) {
                        history.history = encodeURI(JSON.stringify(history.history));
                        history.lastModifiedOn = new Date().getTime();

                        this.sqlStorageService.updateHistory(history)
                            .then(() => { console.log("History added"); })
                            .catch((err) => { console.log(err); })
                    }
                }
            })
        }, 1000);
    }
}