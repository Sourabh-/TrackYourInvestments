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

import { SettingsModalModule } from '../components/settingsModal/settingsModal.module';
import { ReminderModalModule } from '../components/reminderModal/reminderModal.module';
import { SharedModule } from '../shared/shared.module';

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
    DrillDownModal
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    SettingsModalModule,
    SharedModule,
    ReminderModalModule
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
    DrillDownModal
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
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
