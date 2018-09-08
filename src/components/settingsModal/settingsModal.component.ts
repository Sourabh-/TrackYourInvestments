import { Component, OnInit } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'settings-modal',
  templateUrl: 'settingsModal.html'
})
export class SettingsModal implements OnInit {
  
  public settings: any = localStorage['settings'] ? JSON.parse(localStorage['settings']) : this.utilService.getInitialSettings(); 
  constructor(
    public viewCtrl: ViewController,
    public utilService: UtilService
  ) {}

  ngOnInit() {
    this.utilService.onSettingsChange.subscribe(() => {
      this.settings = JSON.parse(localStorage['settings']);
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }  

  getTheme() {
    return this.utilService.theme || 'primary';
  }

  set(ev, type) {
    switch (type) {
      case "isQuoteShow":
        this.settings.quotes.isQuoteShow = ev.checked;
        localStorage['settings'] = JSON.stringify(this.settings);
        this.utilService.resetQuotesNotification(ev.checked);
        break;
    }
  }
}