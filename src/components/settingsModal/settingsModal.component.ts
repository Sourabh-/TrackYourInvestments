import { Component, OnInit } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'settings-modal',
  templateUrl: 'settingsModal.html'
})
export class SettingsModal implements OnInit {
  
  public settings: any = this.utilService.getSettings(); 
  public isReloadReq: boolean = false;

  constructor(
    public viewCtrl: ViewController,
    public utilService: UtilService
  ) {}

  ngOnInit() {
    this.utilService.onSettingsChange.subscribe(() => {
      this.settings = this.utilService.getSettings();
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
    if(this.isReloadReq) this.utilService.emitChangeEvent();
  }  

  getTheme() {
    return this.utilService.theme || 'primary';
  }

  set(ev, type, name?) {
    switch (type) {
      case "isQuoteShow":
        this.settings.quotes.isQuoteShow = ev.checked;
        localStorage['settings'] = JSON.stringify(this.settings);
        this.utilService.resetQuotesNotification(ev.checked);
        break;
      case "showHide":
            this.settings.showHide[name] = ev.checked;
            localStorage['settings'] = JSON.stringify(this.settings);
            this.isReloadReq = true;
        break;
    }
  }
}