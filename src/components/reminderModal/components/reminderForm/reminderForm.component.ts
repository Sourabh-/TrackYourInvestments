import { Component } from '@angular/core';
import { ViewController, NavParams, ToastController } from 'ionic-angular';
import { UtilService } from '../../../../shared/services/util.service';
import { SQLStorageService } from '../../../../shared/services/storage.service';
import { ReminderService } from '../../services/reminder.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
    selector: 'reminder-form',
    templateUrl: 'reminderForm.html'
})
export class ReminderForm {

    public reminder: any = {};
    public isEditable: boolean = false; // Is edit or add screen
    public isEdit: boolean = true; // Allow edit or is just a view screen
    public investments: any = [];
    public minDate: string = '';
    public customOptions: any = {};
    public index: number = 0;
    public delete: Function = () => {}

    constructor(
        private viewCtrl: ViewController,
        public utilService: UtilService,
        public params: NavParams,
        private sqlStorageService: SQLStorageService,
        public toastCtrl: ToastController,
        private reminderService: ReminderService,
        private notificationService: NotificationService
    ) {
        this.reminder = this.params.get('reminder') || {};
        this.index = this.params.get('index');
        // If we are in EDIT/VIEW page
        if (Object.keys(this.reminder).length) {
            console.log(this.reminder);
            this.isEditable = true;
            if(!this.reminder.investmentName || this.reminder.investmentName == 'null') this.reminder.investmentName = null;
            if(this.params.get('isEdit')) {
                this.showEdit();
            } else {
                this.isEdit = false;
            }
            this.delete = this.params.get('delete');
        } else {
            // We are in ADD page
            this.isEdit = true;
        }

        this.investments = this.sqlStorageService.allInvestments || [];
        this.setMinDate();
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    getTheme() {
        return this.utilService.theme || 'primary';
    }

    setMinDate() {
        let tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        this.minDate = tomorrow.getFullYear() + "-" + ('0' + (tomorrow.getMonth() + 1)).slice(-2) + "-" + ('0' + tomorrow.getDate()).slice(-2);
    }

    save() {
        let reminder = JSON.parse(JSON.stringify(this.reminder));
        let dateArr = reminder.whenDateDatePart.split("-");
        let timeArr = reminder.whenDateTimePart.split(":");
        reminder.id = +this.reminderService.generateId();
        reminder.whenDate = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], timeArr[0], timeArr[1]).getTime();
        reminder.createdDate = new Date().getTime();
        delete reminder.whenDateDatePart;
        delete reminder.whenDateTimePart;
        this.sqlStorageService.setReminder(reminder);
        this.rest(reminder);
    }

    showEdit() {
        let whenDate = new Date(this.reminder.whenDate);
        this.reminder.whenDateDatePart = whenDate.getFullYear() + "-" + ("0" + (whenDate.getMonth() + 1)).slice(-2) + "-" + ("0" + whenDate.getDate()).slice(-2);
        this.reminder.whenDateTimePart = ("0" + whenDate.getHours()).slice(-2) + ":" + ("0" + whenDate.getMinutes()).slice(-2);
        this.isEdit = true;
    }

    isWhenDatePassed(whenDateDatePart, whenDateTimePart) {
        if (!whenDateDatePart || !whenDateDatePart) {
            return true;
        } else {
            let dateArr = this.reminder.whenDateDatePart.split("-");
            let timeArr = this.reminder.whenDateTimePart.split(":");
            let whenDate = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], timeArr[0], timeArr[1]).getTime();
            if (this.reminderService.isWhenDatePassed(whenDate))
                return true;
            return false;
        }
    }

    update() {
        let reminder = JSON.parse(JSON.stringify(this.reminder));
        let dateArr = reminder.whenDateDatePart.split("-");
        let timeArr = reminder.whenDateTimePart.split(":");
        reminder.whenDate = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], timeArr[0], timeArr[1]).getTime();
        reminder.createdDate = new Date().getTime(); // Update created date for sorting purpose: So basically createdDate = modifiedDate
        delete reminder.whenDateDatePart;
        delete reminder.whenDateTimePart;
        this.sqlStorageService.updateReminder(reminder, reminder.id).catch((err) => {
            console.log(err);
        });
        this.rest(reminder, 'updateReminderInMemory');
    }

    rest(reminder, key = 'addReminderInMemory') {
        this.toastCtrl.create({
            message: "Nice! Now sit back and relax, we will remind you on time.",
            duration: 3000,
            position: 'bottom'
        }).present();
        this.reminderService[key](reminder);
        this.notificationService.setNotificationForAll(reminder.id, reminder.investmentName || 'Reminder', reminder.notes, reminder.whenDate, { isReminder: true });
        this.dismiss();
    }

    deleteReminder() {
        this.delete(this.reminder, this.index);
        this.dismiss();
    }

    checkEmpty(ev) {
        if(!ev) {
            this.reminder.investmentName = null;
        }
    }
}