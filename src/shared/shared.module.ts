import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule, IonicErrorHandler } from 'ionic-angular';

import { SQLStorageService } from './services/storage.service';
import { UtilService } from './services/util.service';
import { BasicService } from './services/basic.service';
import { CurrencyService } from './services/currency.service';
import { HistoryService } from './services/history.service';
import { NotificationService } from './services/notification.service';
import { SQLite } from '@ionic-native/sqlite';
import { TextEllipses } from './pipes/textEllipsis.pipe';

@NgModule({
    declarations: [
        TextEllipses
    ],
    imports: [
        BrowserModule,
        IonicModule
    ],
    exports: [
        TextEllipses
    ],
    entryComponents: [],
    providers: [
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        SQLite,
        SQLStorageService,
        UtilService,
        BasicService,
        CurrencyService,
        HistoryService,
        NotificationService
    ]
})
export class SharedModule { }
