import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule, IonicErrorHandler } from 'ionic-angular';
import { SettingsModal } from './settingsModal.component';
import { SettingsService } from './services/settings.service';
import { ChartsModal } from './components/charts/charts.component';
import { NotificationsModal } from './components/notifications/notifications.component';
import { CurrencyModal } from './components/currency/currency.component';
import { ThemesModal } from './components/themes/themes.component';
import { FaqModal } from './components/faq/faq.component';

@NgModule({
    declarations: [ 
        SettingsModal,
        ChartsModal,
        NotificationsModal,
        CurrencyModal,
        ThemesModal,
        FaqModal
    ],
    imports: [
        BrowserModule,
        IonicModule
    ],
    exports: [ SettingsModal ],
    entryComponents: [
        SettingsModal,
        ChartsModal,
        NotificationsModal,
        CurrencyModal,
        ThemesModal,
        FaqModal
    ],
    providers: [
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        SettingsService
    ]
})
export class SettingsModalModule { }
