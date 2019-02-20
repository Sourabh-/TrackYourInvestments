import { Component, OnInit } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Market } from '@ionic-native/market';

import { TabsPage } from '../pages/tabs/tabs';
import { SliderPage } from '../pages/slides/slides';
import { UtilService } from '../shared/services/util.service';
import { SQLStorageService } from '../shared/services/storage.service';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { SettingsService } from '../components/settingsModal/services/settings.service';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  rootPage:any = localStorage["isSkip"] ? TabsPage : SliderPage;

  constructor(
    platform: Platform, 
    private statusBar: StatusBar, 
    splashScreen: SplashScreen,
    public utilService: UtilService,
    public alertCtrl: AlertController,
    private market: Market,
    private localNotif: LocalNotifications,
    public sqlStorageService: SQLStorageService,
    private settingsService: SettingsService,
    private notificationService: NotificationService
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
      this.localNotifListener();
    });
  }

  localNotifListener() {
    this.localNotif.on('click').subscribe((inv) => { 

      if(inv.data && (inv.data.isQuote || inv.data.isReminder)) {
        //Show alert with the quote
        const otherAlert = this.alertCtrl.create({
          title: inv.title,
          subTitle: inv.text,
          buttons: ["OK"]
        });

        otherAlert.present();
        return;
      } 

      const reminder = this.alertCtrl.create({
        title: 'Maturity Reminder',
        subTitle: `Hi! Just a sweet reminder. <b>${inv.data.name}</b> is maturing today.`,
        buttons: ["OK"]
      });

      reminder.present();

      //Update investment - change remindMe = 'false'
      this.sqlStorageService.getInvestment(inv.data.name)
      .then((response) => {
        if(response.rows.length) {
          let _inv = response.rows.item(0);
          _inv.remindMe = 'false';

          this.sqlStorageService.updateInvestment(_inv.name, _inv)
          .then((res) => {
            for(let i=0; i < this.sqlStorageService.allInvestments.length; i++) { 
              if(this.sqlStorageService.allInvestments[i].name == _inv.name) {
                this.sqlStorageService.allInvestments[i].remindMe = 'false';
                break;
              } 
            }

            this.utilService.emitChangeEvent();
            this.utilService.emitViewChange();
          })
          .catch((err) => { console.log(err); });
        }
      })
      .catch((err) => { console.log(err); })
    }, (err) => {
      console.log(err);
    })
  }

  ngOnInit() {

    this.utilService.onThemeChange.subscribe(() => {
      this.onThemeChange();
    })

    if(localStorage['isSkip']) {
      this.checkOnRatings();
    }

    this.checkNSwitchOnNotif();
  }

  checkOnRatings() {
    if(!localStorage['showRatingPrompt']) 
      localStorage['showRatingPrompt'] = 1;
    else if(localStorage['showRatingPrompt'] == 7) {
      setTimeout(() => { this.showRatingPrompt(); }, 3000);
      localStorage['showRatingPrompt'] = Number(localStorage['showRatingPrompt']) + 1;
    } else if(localStorage['showRatingPrompt'] < 7) {
      localStorage['showRatingPrompt'] = Number(localStorage['showRatingPrompt']) + 1;
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
          text: 'No, Thank You',
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

  //Check if need to set quotes notifications on. Called from ngOnInit() first
  checkNSwitchOnNotif() {
    let settings: any = this.settingsService.settings;

    //isQuoteSet determines if the below 'if' statement has run before, that is, quotes notifications are already initialized
    if(settings.quotes.isQuoteSet == false && settings.quotes.isQuoteShow == true) {
      //Schedule quotes notification for each day
      this.notificationService.resetQuotesNotification(true);

      settings.quotes.isQuoteSet = true;
      localStorage['settings'] = JSON.stringify(settings);
      this.settingsService.settingsUpdated();
    }
  }
}
