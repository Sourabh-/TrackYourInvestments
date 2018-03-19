import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AddNewPage } from '../pages/addNew/addNew';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { ExistingPage } from '../pages/existing/existing';
import { TabsPage } from '../pages/tabs/tabs';
import { PopoverPage } from '../components/popover/popover.component';
import { FormComponent } from '../components/investmentForm/investmentForm.component';
import { EditModal } from '../components/editModal/editModal.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { SQLStorageService } from '../services/storage.service';
import { UtilService } from '../services/util.service';

@NgModule({
  declarations: [
    MyApp,
    AddNewPage,
    DashboardPage,
    ExistingPage,
    TabsPage,
    PopoverPage,
    FormComponent,
    EditModal
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
    EditModal
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SQLite,
    SQLStorageService,
    UtilService
  ]
})
export class AppModule {}
