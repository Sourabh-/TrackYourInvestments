import { Component } from '@angular/core';
import { ViewController, ModalController, AlertController } from 'ionic-angular';
import { UtilService } from '../../services/util.service';
import { SettingsService } from './services/settings.service';
import { NotificationsModal } from './drilldowns/notifications/notifications.component';
import { ChartsModal } from './drilldowns/charts/charts.component';
import { CurrencyModal } from './drilldowns/currency/currency.component';
import { FaqModal } from './drilldowns/faq/faq.component';
import { ThemesModal } from './drilldowns/themes/themes.component';

@Component({
  selector: 'settings-modal',
  templateUrl: 'settingsModal.html'
})
export class SettingsModal {

  public items = [{
    id: 'notifications',
    name: 'Notifications'
  }, {
    id: 'charts',
    name: 'Charts'
  }, {
    id: 'currency',
    name: 'Currency'
  }, {
    id: 'theme',
    name: 'Theme'
  }, {
    id: 'faq',
    name: 'FAQ'
  }, {
    id: 'aboutUs',
    name: 'About Us'
  }];

  constructor(
    public viewCtrl: ViewController,
    public utilService: UtilService,
    private settingsService: SettingsService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    this.settingsService.isReloadReq = false;
  }

  dismiss() {
    this.viewCtrl.dismiss();
    if (this.settingsService.isReloadReq) this.utilService.emitChangeEvent();
  }

  getTheme() {
    return this.utilService.theme || 'primary';
  }

  openModal(id) {
    let modal;
    switch (id) {
      case 'notifications':
        modal = this.modalCtrl.create(NotificationsModal);
        break;
      case 'charts':
        modal = this.modalCtrl.create(ChartsModal);
        break;
      case 'aboutUs':
        return this.openAboutUs();
      case 'theme':
        modal = this.modalCtrl.create(ThemesModal); 
        break;
      case 'currency':
        modal = this.modalCtrl.create(CurrencyModal);
        break;
      case 'faq':
        modal = this.modalCtrl.create(FaqModal);
        break;
    }
    modal.present();
  }

  openAboutUs() {
    let alert = this.alertCtrl.create({
      title: 'About Us',
      subTitle: `We are a bunch of enthusiastic people who loves the idea of having a passive income. 
                 However, the only problem we faced was to have a simple tracker of our profit & loss 
                 statement. Hence, we built one! We hope this will help you as well. 
                 Your suggestions on how we can improve this tracker are welcome.`,
      buttons: ['OK']
    });
    alert.present();
  }
}