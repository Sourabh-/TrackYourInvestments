import { Component } from '@angular/core';
import { ToastController, ViewController, AlertController } from 'ionic-angular';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html'
})
export class PopoverPage {
  public toastCS: any;

  constructor(
  	public toastCtrl: ToastController,
  	public viewCtrl: ViewController,
    public alertCtrl: AlertController
  ) {
  	this.toastCS = this.toastCtrl.create({
      message: 'Coming in next edition.',
      duration: 3000,
      position: 'bottom'
    });	
  }

  openAboutUs() {
    this.viewCtrl.dismiss();
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
    this.viewCtrl.dismiss();
    this.toastCS.present();
  }

  openWhyInvest() {
  	this.viewCtrl.dismiss();
  	this.toastCS.present();
  }

  openHelp() {
  	this.viewCtrl.dismiss();
  	this.toastCS.present();
  }
}
