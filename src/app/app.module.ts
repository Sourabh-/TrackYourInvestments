import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Market } from '@ionic-native/market';
import { EmailComposer } from '@ionic-native/email-composer';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';
import { LocalNotifications } from '@ionic-native/local-notifications';

import { MyApp } from './app.component';

import { AddNewPage } from '../pages/addNew/addNew';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { ExistingPage } from '../pages/existing/existing';
import { TabsPage } from '../pages/tabs/tabs';
import { SliderPage } from '../pages/slides/slides';
import { PopoverPage } from '../components/popover/popover.component';
import { FormComponent } from '../components/investmentForm/investmentForm.component';
import { EditModal } from '../components/editModal/editModal.component';
import { EmailModal } from '../components/emailModal/emailModal.component';
import { HelpModal } from '../components/helpModal/helpModal.component';
import { HistoryModal } from '../components/historyModal/historyModal.component';
import { CalcModal } from '../components/calcModal/calcModal.component';
import { CalcHelpModal } from '../components/calcHelpModal/calcHelpModal.component';
import { ViewModal } from '../components/viewModal/viewModal.component';
import { DrillDownModal } from '../components/drillDownModal/drillDownModal.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { SQLStorageService } from '../services/storage.service';
import { UtilService } from '../services/util.service';
import { BasicService } from '../services/basic.service';
import { CurrencyService } from '../services/currency.service';
import { HistoryService } from '../services/history.service';
import { SettingsModalModule } from '../components/settingsModal/settingsModal.module';
import { ReminderModal } from '../components/reminderModal/reminder.component';

@NgModule({
  declarations: [
    MyApp,
    AddNewPage,
    DashboardPage,
    ExistingPage,
    TabsPage,
    SliderPage,
    PopoverPage,
    FormComponent,
    EditModal,
    EmailModal,
    HelpModal,
    HistoryModal,
    CalcModal,
    CalcHelpModal,
    ViewModal,
    DrillDownModal,
    ReminderModal
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    SettingsModalModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AddNewPage,
    DashboardPage,
    ExistingPage,
    TabsPage,
    SliderPage,
    PopoverPage,
    FormComponent,
    EditModal,
    EmailModal,
    HelpModal,
    HistoryModal,
    CalcModal,
    CalcHelpModal,
    ViewModal,
    DrillDownModal,
    ReminderModal
  ],
  providers: [
    StatusBar,
    SplashScreen,
    InAppBrowser,
    Market,
    EmailComposer,
    File,
    SocialSharing,
    LocalNotifications,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SQLite,
    SQLStorageService,
    UtilService,
    BasicService,
    CurrencyService,
    HistoryService
  ]
})
export class AppModule {}
