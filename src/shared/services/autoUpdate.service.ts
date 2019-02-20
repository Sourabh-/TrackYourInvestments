import { Injectable } from "@angular/core";
import { SQLStorageService } from "./storage.service";
import { BasicService } from "./basic.service";
import { UtilService } from "./util.service";
import { HistoryService } from "./history.service";

@Injectable()
export class AutoUpdateService {
    constructor(
        private sqlStorageService: SQLStorageService,
        private basic: BasicService,
        public utilService: UtilService,
        public historyService: HistoryService
    ) { }

    checkNUpdate() {
        // Delay by sometime as its not needed immediately
        // and should not affect UI rendering
        setTimeout(() => {
            let investments = JSON.parse(JSON.stringify(this.sqlStorageService.allInvestments));
            let today = new Date().getTime();
            // Loop through each investment
            for (let i = 0; i < investments.length; i++) {
                ((i) => {
                    let update: any = {};
                    let oldValue: any = {};
                    if (investments[i].addition && (investments[i].addition.tillDate && investments[i].addition.tillDate !== 'null' ? today <= Number(investments[i].addition.tillDate) : true)) {
                        // Check if auto update is needed
                        let quotient = this.calculateNUpdate(investments[i], 'addition', today);
                        if (quotient >= 1) {
                            oldValue.totalAmount = investments[i].totalAmount;
                            investments[i].totalAmount += investments[i].addition.amount * quotient;
                            update.totalAmount = investments[i].totalAmount;
                        }
                    }

                    if (investments[i].profitAddition && (investments[i].profitAddition.tillDate && investments[i].profitAddition.tillDate !== 'null' ? today <= Number(investments[i].profitAddition.tillDate) : true)) {
                        // Check if auto update is needed
                        let quotient = this.calculateNUpdate(investments[i], 'profitAddition', today);
                        if (quotient >= 1) {
                            oldValue.profit = investments[i].profit;
                            investments[i].profit += investments[i].profitAddition.profit * quotient;
                            update.profit = investments[i].profit;
                        }
                    }

                    if (Object.keys(update).length) {
                        this.sqlStorageService.updateInvestment(investments[i].name, update)
                            .then(() => {
                                if (update.totalAmount) {
                                    this.sqlStorageService.updateAddOrProfitAdd({}, 'addition', investments[i].name)
                                        .then(() => { })
                                        .catch((err) => {
                                            console.log(err);
                                        });

                                    //Update history
                                    this.historyService.addToHistory(
                                        { 
                                          name: investments[i].name,
                                          totalAmount: update.totalAmount
                                        },
                                        {
                                          name: investments[i].name,
                                          totalAmount: oldValue.totalAmount
                                        },
                                        null,
                                        true
                                    );
                                }

                                if (update.profit) {
                                    this.sqlStorageService.updateAddOrProfitAdd({}, 'profitAddition', investments[i].name)
                                        .then(() => { })
                                        .catch((err) => {
                                            console.log(err);
                                        });

                                    //Update history
                                    this.historyService.addToHistory(
                                        { 
                                          name: investments[i].name,
                                          profit: update.profit
                                        },
                                        {
                                          name: investments[i].name,
                                          profit: oldValue.profit
                                        },
                                        null,
                                        true
                                    );
                                }
                            })
                            .catch((err) => { console.log(err); });
                    }
                })(i);
            }

            if (!this.basic.isEqual(investments, this.sqlStorageService.allInvestments)) {
                this.sqlStorageService.allInvestments = [...investments];
                this.utilService.emitChangeEvent();
            }
        }, 1000);
    }

    calculateNUpdate(investment, type, today) {
        let updateValues = investment[type];
        let lastUpdated = updateValues.modifiedDate;
        // Difference in months
        let diffInMonths = (today - lastUpdated) / (1000 * 60 * 60 * 24 * 30);
        return Math.ceil(diffInMonths / updateValues.period);
    }
}