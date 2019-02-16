import { Injectable } from "@angular/core";
import { SQLStorageService } from "../../../shared/services/storage.service";
import { BasicService } from "../../../shared/services/basic.service";

@Injectable()
export class ReminderService {
    public reminders: any = [];

    constructor(
        private sqlStorageService: SQLStorageService,
        public basic: BasicService
    ) {
        this.getReminders();
    }

    getReminders() {
        this.sqlStorageService.getReminders()
            .then((response) => {
                if (response.rows.length) {
                    for (let i = 0; i < response.rows.length; i++) {
                        this.reminders.push(response.rows.item(i));
                    }

                    this.reminders = this.basic.sortObjectArr(this.reminders, 'createdDate', true);
                }
            })
            .catch((err) => {
                //console.log(err);
            })
    }

    // For quick update of reminders list
    addReminderInMemory(reminder) {
        this.reminders.unshift(reminder);
    }

    // For quick update of reminders list
    updateReminderInMemory(reminder) {
        for (let i = 0; i < this.reminders.length; i++) {
            if (reminder.id == this.reminders[i].id) {
                this.reminders[i] = reminder;
                break;
            }
        }
        this.reminders = this.basic.sortObjectArr(this.reminders, 'createdDate', true);
    }

    deleteReminderFromMemory(index) {
        this.reminders.splice(index, 1);
    }

    generateId() {
        return new Date().valueOf() + "" + Math.floor(Math.random() * 1000);
    }

    isWhenDatePassed(whenDate) {
        if (whenDate < new Date().getTime()) {
            return true;
        }

        return false;
    }
}