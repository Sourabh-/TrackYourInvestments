import { Component, OnInit } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

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
    public utilService: UtilService
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
  }

  onThemeChange() {
    this.statusBar.backgroundColorByHexString(this.utilService.theme == 'primary' ? '#1976D2' : '#000000');
  }
}
