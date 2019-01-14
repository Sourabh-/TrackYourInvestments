import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { UtilService } from '../../../../services/util.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'notifications-settings-modal',
  templateUrl: 'notifications.html'
})
export class NotificationsModal {

  constructor(
    public viewCtrl: ViewController,
    public utilService: UtilService,
    public settingsService: SettingsService
  ) {}

  dismiss() {
    this.viewCtrl.dismiss();
  }  

  getTheme() {
    return this.utilService.theme || 'primary';
  }
}