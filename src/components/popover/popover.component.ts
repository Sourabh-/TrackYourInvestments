import { Component } from '@angular/core';
import { ToastController, ViewController, AlertController, ModalController } from 'ionic-angular';
import { Market } from '@ionic-native/market';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import CurrencyToSymbolMap from 'currency-symbol-map/map';
import { CurrencyModal } from '../currencyModal/currencyModal.component';
import { EmailModal } from '../emailModal/emailModal.component';
import { HelpModal } from '../helpModal/helpModal.component';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html'
})
export class PopoverPage {
  public toastCS: any;

  constructor(
  	public toastCtrl: ToastController,
  	public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    private iab: InAppBrowser,
    private market: Market,
    public modalCtrl: ModalController
  ) {
  	this.toastCS = this.toastCtrl.create({
      message: 'Coming in next edition.',
      duration: 3000,
      position: 'bottom'
    });	
  }

  openAboutUs() {
    this.dismiss();
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

  openRateUs() {
    this.dismiss();
    this.market.open('io.uns.trackYourInvestments');
  }

  openWhyInvest() {
  	this.dismiss();
  	this.iab.create('https://www.allbusiness.com/top-10-reasons-to-invest-money-93916-1.html');
  }

  openHelp() {
  	this.dismiss();
  	let modal = this.modalCtrl.create(HelpModal);
    modal.present();
  }

  chooseCurr(curr) {
    this.dismiss();
    let modal = this.modalCtrl.create(CurrencyModal);
    modal.present();
  }

  openEmailUs() {
    this.dismiss();
    let modal = this.modalCtrl.create(EmailModal);
    modal.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
