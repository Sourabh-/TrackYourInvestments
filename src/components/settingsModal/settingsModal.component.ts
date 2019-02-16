import { Component } from '@angular/core';
import { ViewController, ModalController, AlertController } from 'ionic-angular';
import { UtilService } from '../../shared/services/util.service';
import { SettingsService } from './services/settings.service';
import { NotificationsModal } from './components/notifications/notifications.component';
import { ChartsModal } from './components/charts/charts.component';
import { CurrencyModal } from './components/currency/currency.component';
import { FaqModal } from './components/faq/faq.component';
import { ThemesModal } from './components/themes/themes.component';

@Component({
  selector: 'settings-modal',
  templateUrl: 'settingsModal.html'
})
export class SettingsModal {

  public items = [{
    id: 'notifications',
    name: 'Notifications',
    icon: 'notifications-outline'
  }, {
    id: 'charts',
    name: 'Charts',
    icon: 'stats'
  }, {
    id: 'currency',
    name: 'Currency',
    icon: 'cash'
  }, {
    id: 'theme',
    name: 'Theme',
    icon: 'color-palette'
  }, {
    id: 'faq',
    name: 'FAQ',
    icon: 'help'
  }, {
    id: 'aboutUs',
    name: 'About Us',
    icon: 'information-circle'
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