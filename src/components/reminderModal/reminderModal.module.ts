import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule, IonicErrorHandler } from 'ionic-angular';
import { ReminderModal } from './reminderModal.component';
import { ReminderForm } from './components/reminderForm/reminderForm.component';
import { ReminderService } from './services/reminder.service';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [ 
        ReminderModal,
        ReminderForm
    ],
    imports: [
        BrowserModule,
        IonicModule,
        SharedModule
    ],
    exports: [ ReminderModal ],
    entryComponents: [
        ReminderModal,
        ReminderForm
    ],
    providers: [
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        ReminderService
    ]
})
export class ReminderModalModule { }
 