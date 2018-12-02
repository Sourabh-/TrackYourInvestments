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
  public addition: any = {}; //Monthly addition
  public profitAddition: any = {};
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
    console.log(this.investment);
    this.checkForAdditions();
    _ = this;
    this.reload = this.params.get('reload');
    let sDate = new Date(this.investment.startDate);
  	this.investment.startDate = sDate.getFullYear() + "-" + ("0" + (sDate.getMonth() + 1)).slice(-2) + "-" + ("0" + sDate.getDate()).slice(-2);
    //Check on maturity date
    if(this.investment.maturityDate && this.investment.maturityDate !== 'null') {
      let mDate = new Date(this.investment.maturityDate);
      this.investment.maturityDate = mDate.getFullYear() + "-" + ("0" + (mDate.getMonth() + 1)).slice(-2) + "-" + ("0" + mDate.getDate()).slice(-2);
    }

    if(this.investment.remindMe == 'true') {
      this.investment.remindMe = true;
    } else {
      this.investment.remindMe = false;
    }

    this.setMaxDate();
    this.fetchHistory();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  checkForAdditions() {
    if(this.investment.addition) {
      this.addition = JSON.parse(JSON.stringify(this.investment.addition));
      if(this.addition.tillDate && this.addition.tillDate !== 'null') {
        let aDate = new Date(this.addition.tillDate);
        this.addition.tillDate = aDate.getFullYear() + "-" + ("0" + (aDate.getMonth() + 1)).slice(-2);
      }
      delete this.investment.addition;
    } else {
      this.resetAddition();
    }

    if(this.investment.profitAddition) {
      this.profitAddition = JSON.parse(JSON.stringify(this.investment.profitAddition));
      if(this.profitAddition.tillDate && this.profitAddition.tillDate !== 'null') {
        let aDate = new Date(this.profitAddition.tillDate);
        this.profitAddition.tillDate = aDate.getFullYear() + "-" + ("0" + (aDate.getMonth() + 1)).slice(-2);
      }
      delete this.investment.profitAddition; 
    } else {
      this.resetProfitAddition();
    }
  }

  resetAddition() {
    this.addition = {
      name: '',
      amount: 0,
      period: 1,
      tillDate: null,
      done: false
    };
  }

  resetProfitAddition() {
    this.profitAddition = {
      name: '',
      profit: 0,
      period: 1,
      tillDate: null,
      done: false
    };
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
      _.errorMsg = "Umm.. Loss cannot be more than total investment amount *";
      _.isError = true;
    } else if(_.addition.amount && (!_.addition.period || Number(_.addition.period) <= 0)) {
      _.errorMsg = "Period for auto addition of invested amount cannot be 0 *";;
      _.isError = true;
    } else if(_.profitAddition.profit && (!_.profitAddition.period || Number(_.profitAddition.period) <= 0)) {
      _.errorMsg = "Period for auto addition of profit amount cannot be 0 *";
      _.isError = true;
    } else {
      _.isDisabled = true;
      let _investment = JSON.parse(JSON.stringify(_.investment));

      let _add = JSON.parse(JSON.stringify(_.addition));
      let _profitAdd = JSON.parse(JSON.stringify(_.profitAddition));

      let sDate = _investment.startDate.split('-');
      _investment.startDate = new Date(sDate[0], Number(sDate[1])-1, sDate[2]).getTime();

      //Check on maturity date
      if(_investment.maturityDate && _investment.maturityDate !== 'null') {
        let mDate = _investment.maturityDate.split('-');
        _investment.maturityDate = new Date(mDate[0], Number(mDate[1])-1, mDate[2]).getTime();
        //Check if nofification is needed
        if(_investment.remindMe) _investment.remindMe = 'true';
        else _investment.remindMe = 'false';
      } else {
        _investment.maturityDate = null;
        _investment.remindMe = 'false';
      }

      if(!_investment.notes) _investment.notes = '';

      _.sqlStorageService.updateInvestment(_investment.name, _investment)
      .then((response) => {
        _.isDisabled = false;
        _.toastCtrl.create({
          message: "Your changes are saved",
          duration: 3000,
          position: 'bottom'
        }).present();

        //Set or remove notification if needed
        _.setOrRemoveNotifIfNeeded(_investment);

        setTimeout(() => {
          //================SET ADDITION=================//
          if(_.addition.amount && Number(_.addition.amount) > 0) {
            _add.name = _investment.name;
            if(_add.tillDate) {
              let aDate = _add.tillDate.split('-');
              _add.tillDate = new Date(aDate[0], Number(aDate[1])-1).getTime();
            }

            _.sqlStorageService.updateAddOrProfitAdd(_add, 'addition', _add.name)
            .then(() => { console.log("UPDATED"); _.resetAddition();  }).catch((err) => { console.log("FAILED"); console.log(err); })
          } else {
            _.sqlStorageService.delAddOrProfitAdd('addition', _investment.name).then(() => { console.log("ADDITION DELETED"); }).catch((err) => { console.log("ADDITION DELETION FAILED"); console.log(err); })
          }
          //=============================================//

          //============SET PROFIT-ADDITION==============//
          if(_.profitAddition.profit && Number(_.addition.profit) > 0) {
            _profitAdd.name = _investment.name;
            if(_profitAdd.tillDate) {
              let aDate = _profitAdd.tillDate.split('-');
              _profitAdd.tillDate = new Date(aDate[0], Number(aDate[1])-1).getTime();
            }

            _.sqlStorageService.updateAddOrProfitAdd(_profitAdd, 'profitAddition', _profitAdd.name)
            .then(() => { _.resetProfitAddition(); }).catch((err) => { console.log(err); })
          } else {
            _.sqlStorageService.delAddOrProfitAdd('profitAddition', _investment.name).then(() => { console.log("PROFIT ADDITION DELETED"); }).catch((err) => { console.log("PROFIT ADDITION DELETION FAILED"); console.log(err); })
          }
          //=============================================//
        }, 1000);

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

    if(inv.maturityDate != this.oldValue.maturityDate && inv.maturityDate && inv.maturityDate != 'null') {
      this.history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Maturity Date was changed from ${this.oldValue.maturityDate && this.oldValue.maturityDate !== 'null' ? this.utilService.getDate(this.oldValue.maturityDate, true) : '-'} to ${this.utilService.getDate(inv.maturityDate, true)}.`);
      flag = 1;
    }

    if(inv.notes != this.oldValue.notes) {
      this.history.history.unshift(`On ${this.utilService.getDate(new Date().getTime(), true)}, Notes were updated.`);
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

  setOrRemoveNotifIfNeeded(investment) {
    if(investment.remindMe == 'false') {
      this.utilService.clearNotification(investment.name);
    } else {
      this.utilService.setNotification(investment.name, investment.name, "Hi! A reminder. This investment is maturing today.", (investment.maturityDate + (1000 * 60 * 60 * 7)), investment);
    }
  }
}