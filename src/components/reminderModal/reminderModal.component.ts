import { Component, ViewChild } from '@angular/core';
import { ViewController, ModalController, AlertController, List } from 'ionic-angular';
import { UtilService } from '../../shared/services/util.service';
import { ReminderForm } from './components/reminderForm/reminderForm.component';
import { ReminderService } from './services/reminder.service';
import { SQLStorageService } from '../../shared/services/storage.service';
import { NotificationService } from '../../shared/services/notification.service';

let _;
@Component({
    selector: 'reminder-modal',
    templateUrl: 'reminderModal.html'
})
export class ReminderModal {

    @ViewChild(List) list: List;
    public isLoading: boolean = true;
    constructor(
        private viewCtrl: ViewController,
        public utilService: UtilService,
        public modalCtrl: ModalController,
        public reminderService: ReminderService,
        private alertCtrl: AlertController,
        private sqlStorageService: SQLStorageService,
        private notificationService: NotificationService
    ) {
        _ = this;
        setTimeout(() => { this.isLoading = false; }, 700);
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    getTheme() {
        return this.utilService.theme || 'primary';
    }

    openAddOrEditReminderModal(reminder = null, index?, isEdit = false) {
        this.list.closeSlidingItems();
        let modal = this.modalCtrl.create(ReminderForm, {
            reminder,
            index,
            isEdit,
            delete: this.delete
        });
        modal.present();
    }

    delete(reminder, index) {
        _.list.closeSlidingItems();
        let confirm = _.alertCtrl.create({
            title: 'Are you sure ?',
            message: '',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        //DO NOTHING
                    }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        _.sqlStorageService.deleteReminder(reminder.id).catch((err) => {
                            console.log(err);
                        });
                        _.notificationService.clearNotificationForAll(reminder.id);
                        _.reminderService.deleteReminderFromMemory(index);
                    }
                }
            ]
        });
        confirm.present();
    }
}