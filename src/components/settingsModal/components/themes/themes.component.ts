import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { UtilService } from '../../../../shared/services/util.service';

@Component({
  selector: 'theme-settings-modal',
  templateUrl: 'themes.html'
})
export class ThemesModal {

  public themes = [{
    id: 'primary',
    name: 'Light'
  }, {
    id: 'dark',
    name: 'Dark'
  }];
  constructor(
    public viewCtrl: ViewController,
    public utilService: UtilService
  ) {

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  selectTheme(theme) {
    this.utilService.switchTheme(theme);
    this.dismiss();
  }

  getTheme() {
    return this.utilService.theme || 'primary';
  }
}