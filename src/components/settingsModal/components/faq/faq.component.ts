import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { UtilService } from '../../../../shared/services/util.service';
import { faqs } from '../../../../shared/data';

@Component({
  selector: 'faq-settings-modal',
  templateUrl: 'faq.html'
})
export class FaqModal {
  public _faqs = faqs;
  constructor(
    public viewCtrl: ViewController,
    public utilService: UtilService
  ) {

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getTheme() {
    return this.utilService.theme || 'primary';
  }
}