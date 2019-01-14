import { Component, OnInit } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { CurrencyService } from '../../../../services/currency.service';
import { UtilService } from '../../../../services/util.service';

@Component({
  selector: 'currency-settings-modal',
  templateUrl: 'currency.html'
})
export class CurrencyModal implements OnInit {
	public selectedCurr = localStorage.currency ? JSON.parse(localStorage.currency) : { name: 'USD', symbol: '$' };
	public currSymbolsMap = [];

	constructor(
		public viewCtrl: ViewController,
		public currencyService: CurrencyService,
		public utilService: UtilService
	) {
		
	}

  ngOnInit() {
    this.currSymbolsMap = this.currencyService.currSymbolsMap;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  selectCurrency(curr) {
	this.selectedCurr = curr;
	localStorage.currency = JSON.stringify(this.selectedCurr);
	this.currencyService.changeCurrency.emit();
    this.dismiss();
  }

  getTheme() {
  	return this.utilService.theme || 'primary';
  }
}