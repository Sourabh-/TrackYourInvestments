import { Component } from '@angular/core';
import { ViewController, NavParams, ToastController } from 'ionic-angular';
import { UtilService } from '../../shared/services/util.service';
import { SQLStorageService } from '../../shared/services/storage.service';

@Component({
  selector: 'history-modal',
  templateUrl: 'historyModal.html'
})
export class HistoryModal {

	public investment: any = {};
	public history: any = { history: [] };
	constructor(
		public params: NavParams,
		public viewCtrl: ViewController,
		public utilService: UtilService,
		public sqlStorageService: SQLStorageService,
		public toastCtrl: ToastController
	) {
		this.investment = this.params.get('investment');
		this.fetchHistory(this.investment.name);
	}

	dismiss() {
    	this.viewCtrl.dismiss();
  	}

  	fetchHistory(name) {
  		this.sqlStorageService.getHistory(name)
  		.then((response) => {
  			if(response.rows.length) {
  				this.history = response.rows.item(0);
  				this.history.history = JSON.parse(decodeURI(response.rows.item(0).history));
  			} else {
          this.history = { history: [] };
        }
  		})
  		.catch((err) => {
  			console.log(err);
  			this.toastCtrl.create({
		      message: "Oops! Looks like something isn't right, try closing the app and reopen",
		      duration: 3000,
		      position: 'bottom'
		    }).present(); 
  		})
  	}

  	getLastModifiedDate() {
  		if(this.history['lastModifiedOn']) {
  			return this.utilService.getDate(Number(this.history['lastModifiedOn']), true);
  		}
  	}
}