import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Market } from '@ionic-native/market';
import { EmailComposer } from '@ionic-native/email-composer';

import { MyApp } from './app.component';

import { AddNewPage } from '../pages/addNew/addNew';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { ExistingPage } from '../pages/existing/existing';
import { TabsPage } from '../pages/tabs/tabs';
import { PopoverPage } from '../components/popover/popover.component';
import { FormComponent } from '../components/investmentForm/investmentForm.component';
import { EditModal } from '../components/editModal/editModal.component';
import { EmailModal } from '../components/emailModal/emailModal.component';
import { CurrencyModal } from '../components/currencyModal/currencyModal.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { SQLStorageService } from '../services/storage.service';
import { UtilService } from '../services/util.service';
import { CurrencyService } from '../services/currency.service';

@NgModule({
  declarations: [
    MyApp,
    AddNewPage,
    DashboardPage,
    ExistingPage,
    TabsPage,
    PopoverPage,
    FormComponent,
    EditModal,
    CurrencyModal,
    EmailModal
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AddNewPage,
    DashboardPage,
    ExistingPage,
    TabsPage,
    PopoverPage,
    FormComponent,
    EditModal,
    CurrencyModal,
    EmailModal
  ],
  providers: [
    StatusBar,
    SplashScreen,
    InAppBrowser,
    Market,
    EmailComposer,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SQLite,
    SQLStorageService,
    UtilService,
    CurrencyService
  ]
})
export class AppModule {}
