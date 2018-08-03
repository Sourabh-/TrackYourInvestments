import { Component, Input } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { types } from '../../data/data';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'investment-form',
  templateUrl: 'investmentForm.html'
})
export class FormComponent {

	@Input() handleFormSubmit: Function;
	@Input() investment: any;
	@Input() isError: boolean;
	@Input() errorMsg: string;
	@Input() maxDate: string;
	@Input() isEdit: boolean;
	@Input() isDisabled: boolean;
	@Input() submitButtonText: string;
	public types = types;
	public minDate: string = '';
	public customOptions: any = {};

	constructor(
		public utilService: UtilService,
		public alertCtrl: AlertController
	) {
		this.setMinDate();
		this.customOptions = {
			buttons: [{
				text: 'Clear',
				handler: () => { 
					this.investment.maturityDate = ''; 
					this.investment.remindMe = false;
				}
			}]
		}
	}

	setMinDate() {
		let tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    	this.minDate = tomorrow.getFullYear() + "-" + ('0' + (tomorrow.getMonth() + 1)).slice(-2) + "-" + ('0' + tomorrow.getDate()).slice(-2);
	}

	getTheme() {
  		return this.utilService.theme || 'primary';
  	}

  	showRemindMeHelp() {
  		let alert = this.alertCtrl.create({
	      title: 'Set Reminder Help',
	      subTitle: `Check this option if you want to get notified on the day of maturity of this investment.`,
	      buttons: ['OK']
	    });
    	alert.present();
  	}

  	validate = (ev) => {
  		ev.value = ev.value.replace(/[^a-zA-Z0-9 ]/g, '');
  	}

  	isMaturityDatePassed() {
  		if(this.investment.maturityDate) {
  			let mDate: any = this.investment.maturityDate.split('-');
  			mDate = new Date(mDate[0], Number(mDate[1])-1, mDate[2]).getTime();
  			let tomorrow: any = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  			tomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).getTime();
  			return (mDate < tomorrow);
  		} else {
  			return false;
  		}
  	}
}