import { Component, OnInit } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Market } from '@ionic-native/market';

import { TabsPage } from '../pages/tabs/tabs';
import { SliderPage } from '../pages/slides/slides';
import { UtilService } from '../services/util.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  rootPage:any = localStorage.isSkip ? TabsPage : SliderPage;

  constructor(
    platform: Platform, 
    private statusBar: StatusBar, 
    splashScreen: SplashScreen,
    public utilService: UtilService,
    public alertCtrl: AlertController,
    private market: Market
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // let status bar overlay webview
      //statusBar.styleDefault();
      statusBar.overlaysWebView(false);

      // set status bar to white
      statusBar.backgroundColorByHexString(this.utilService.theme == 'primary' ? '#1976D2' : '#000000');
      splashScreen.hide();
    });
  }

  ngOnInit() {
    this.utilService.onThemeChange.subscribe(() => {
      this.onThemeChange();
    })

    if(localStorage.isSkip) {
      this.checkOnRatings();
    }
  }

  checkOnRatings() {
    if(!localStorage.showRatingPrompt) 
      localStorage.showRatingPrompt = 1;
    else if(localStorage.showRatingPrompt == 7) {
      setTimeout(() => { this.showRatingPrompt(); }, 3000);
      localStorage.showRatingPrompt = Number(localStorage.showRatingPrompt) + 1;
    } else if(localStorage.showRatingPrompt < 7) {
      localStorage.showRatingPrompt = Number(localStorage.showRatingPrompt) + 1;
    }
  }

  onThemeChange() {
    this.statusBar.backgroundColorByHexString(this.utilService.theme == 'primary' ? '#1976D2' : '#000000');
  }

  showRatingPrompt() {
    const prompt = this.alertCtrl.create({
      title: 'Rate Us',
      message: 'It seems our app is helping you manage your investments efficiently. Would you like to rate our app?',
      buttons: [
        {
          text: 'Dismiss',
          handler: () => {
            console.log('Dismiss clicked');
          }
        },
        {
          text: 'Yes I would like to',
          handler: () => {
            this.market.open('io.uns.trackYourInvestments');
          }
        }
      ]
    });
    prompt.present();
  }
}
