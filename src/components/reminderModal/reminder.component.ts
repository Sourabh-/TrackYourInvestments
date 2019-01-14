import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
    selector: 'reminder-modal',
    templateUrl: 'reminder.html'
})
export class ReminderModal {
    constructor(
        private viewCtrl: ViewController
    ) {}

    dismiss() {
        this.viewCtrl.dismiss();
    }
}