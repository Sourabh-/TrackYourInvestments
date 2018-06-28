import { Component } from '@angular/core';
import { NavParams, ViewController, ToastController } from 'ionic-angular';
import { FormComponent } from '../investmentForm/investmentForm.component';
import { SQLStorageService } from '../../services/storage.service';
import { UtilService } from '../../services/util.service';

let _;

@Component({
  selector: 'edit-modal',
  templateUrl: 'editModal.html'
})
export class EditModal {
  public investment: any;
  public history: any = {};
  public oldValue: any;
  public isError: boolean = false;
  public errorMsg: string = '';
  public maxDate: string;
  public reload: Function;
  public isDisabled: boolean = false;

  constructor(
    public params: NavParams, 
    public viewCtrl: ViewController,
    public sqlStorageService: SQLStorageService,
    public toastCtrl: ToastController, 
    private utilService: UtilService
  ) {
  	this.investment = this.params.get('investment');
    this.oldValue = JSON.parse(JSON.stringify(this.params.get('investment')));
    _ = this;
    this.reload = this.params.get('reload');
    let sDate = new Date(this.investment.startDate);
  	this.investment.startDate = sDate.getFullYear() + "-" + ("0" + (sDate.getMonth() + 1)).slice(-2) + "-" + ("0" + sDate.getDate()).slice(-2);
    
    this.setMaxDate();
    this.fetchHistory();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  fetchHistory() {
    this.sqlStorageService.getHistory(this.investment.name)
      .then((response) => {
        if(response.rows.length) {
          this.history = response.rows.item(0);
          this.history.history = JSON.parse(decodeURI(response.rows.item(0).history));
        } else {
          this.history = { history: [], name: this.investment.name, lastModifiedOn: new Date().getTime() };
        }
      })
      .catch((err) => {
        this.history = { history: [], name: this.investment.name, lastModifiedOn: new Date().getTime() };
      })
  }

  handleFormSubmit() {
    _.isError = false;
    if(Number(_.investment.loss) > Number(_.investment.totalAmount)) {
      _.errorMsg = "Loss cannot be more than total investment amount *";
      _.isError = true;
    } else {
      _.isDisabled = true;
      let _investment = JSON.parse(JSON.stringify(_.investment));
      let sDate = _investment.startDate.split('-');
      _investment.startDate = new Date(sDate[0], Number(sDate[1])-1, sDate[2]).getTime();
      _.sqlStorageService.updateInvestment(_investment.name, _investment)
      .then((response) => {
        _.isDisabled = false;
        _.toastCtrl.create({
          message: "Saved successfully",
          duration: 3000,
          position: 'bottom'
        }).present();
        _.sqlStorageService.getInvestments(true)
        .then((response) => { 
          let _invs = [];
          for(let i=0; i<response.rows.length; i++) {
            _invs.push(response.rows.item(i));
          }
          _.sqlStorageService.allInvestments = _invs;
          //CALL RELOAD SUBSCRIPTION
          _.utilService.emitChangeEvent();
        })
        .catch((err) => {
          console.log(err);
          _.isDisabled = false;
          //SHOW TOAST
          _.toastCtrl.create({
            message: "Oops! Looks like something isn't right, try closing the app and reopen",
            duration: 3000,
            position: 'bottom'
          }).present();
        })


        //Add to history
        _.addToHistory(_investment);

        _.viewCtrl.dismiss();
      })
      .catch((err) => {
        console.log(err);
        _.toastCtrl.create({
          message: "Oops! Looks like something isn't right, try closing the app and reopen",
          duration: 3000,
          position: 'bottom'
        }).present();
      })
    }
  }

  addToHistory(inv) {
    let flag = 0;
    if(inv.totalAmount != this.oldValue.totalAmount) {
      this.history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Total Amount was changed from ${this.oldValue.totalAmount} to ${inv.totalAmount}.`);
      flag = 1;
    }

    if(inv.startDate != this.oldValue.startDate) {
      this.history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Start Date was changed from ${this.utilService.getDate(this.oldValue.startDate, true)} to ${this.utilService.getDate(inv.startDate, true)}.`);
      flag = 1;
    }

    if(inv.type != this.oldValue.type) {
      this.history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Investment Type was changed from ${this.utilService.invTypes[this.oldValue.type]} to ${this.utilService.invTypes[inv.type]}.`);
      flag = 1;
    }

    if(inv.profit != this.oldValue.profit) {
      this.history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Profit Amount was changed from ${this.oldValue.profit} to ${inv.profit}.`);
      flag = 1;
    }  

    if(inv.loss != this.oldValue.loss) {
      this.history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Loss Amount was changed from ${this.oldValue.loss} to ${inv.loss}.`);
      flag = 1;
    }

    if(this.history.history.length > 20) {
      this.history.history = this.history.history.slice(0, 20);
      flag = 1;
    }

    if(flag == 1) {
      this.history.history = encodeURI(JSON.stringify(this.history.history));
      this.history.lastModifiedOn = new Date().getTime();

      this.sqlStorageService.updateHistory(this.history)
      .then(() => { console.log("History added"); })
      .catch((err) => { console.log(err); })
    }
  }

  setMaxDate() {
    let today = new Date();
    this.maxDate = today.getFullYear() + "-" + ('0' + today.getMonth()).slice(-2) + "-" + ('0' + today.getDate()).slice(-2);
  }
}