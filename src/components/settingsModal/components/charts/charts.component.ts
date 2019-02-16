import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { UtilService } from '../../../../shared/services/util.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'charts-settings-modal',
  templateUrl: 'charts.html'
})
export class ChartsModal {

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