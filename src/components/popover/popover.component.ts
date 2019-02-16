import { Component } from '@angular/core';
import { ToastController, ViewController, AlertController, ModalController } from 'ionic-angular';
import { Market } from '@ionic-native/market';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SocialSharing } from '@ionic-native/social-sharing';
import { UtilService } from '../../shared/services/util.service';
import { EmailModal } from '../emailModal/emailModal.component';
import { HelpModal } from '../helpModal/helpModal.component';
import { SettingsModal } from '../settingsModal/settingsModal.component';
import { ReminderModal } from '../reminderModal/reminderModal.component';

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
    private socialSharing: SocialSharing,
    private market: Market,
    public modalCtrl: ModalController,
    public utilService: UtilService
  ) {
  	this.toastCS = this.toastCtrl.create({
      message: 'Coming in next edition',
      duration: 3000,
      position: 'bottom'
    });	
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

  openEmailUs() {
    this.dismiss();
    let modal = this.modalCtrl.create(EmailModal);
    modal.present();
  }

  shareApp() {
    this.dismiss();
    this.socialSharing.share("Hello! I have been using Investment Tracker to manage all my investments and analyze them using easy to read graphs! I suggest you should also download the app now at ", null, null, "https://play.google.com/store/apps/details?id=io.uns.trackYourInvestments")
    .then(() => {
        console.log('Shared');
    }).catch((err) => {
        console.log(err);
    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  openSettings() {
    this.dismiss();
    let modal = this.modalCtrl.create(SettingsModal);
    modal.present();
  }

  openReminder() {
    this.dismiss();
    let modal = this.modalCtrl.create(ReminderModal);
    modal.present();
  }
}
