import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'calc-help-modal',
  templateUrl: 'calcHelpModal.html'
})
export class CalcHelpModal {
  public links: any = [];

  constructor(
    public viewCtrl: ViewController,
    public utilService: UtilService
  ) {}

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getTheme() {
    return this.utilService.theme || 'primary';
  }
}