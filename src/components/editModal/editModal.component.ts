import { Component } from '@angular/core';
import { NavParams, ViewController, ToastController } from 'ionic-angular';
import { FormComponent } from '../investmentForm/investmentForm.component';
import { SQLStorageService } from '../../shared/services/storage.service';
import { UtilService } from '../../shared/services/util.service';
import { BasicService } from '../../shared/services/basic.service';
import { HistoryService } from '../../shared/services/history.service';
import { NotificationService } from '../../shared/services/notification.service';

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
  public oldAdd: any = {
    name: '',
    amount: 0,
    period: 1,
    tillDate: null
  };
  public oldProfitAdd: any = {
    name: '',
    profit: 0,
    period: 1,
    tillDate: null
  };
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
    private utilService: UtilService,
    public basic: BasicService,
    public historyService: HistoryService,
    public notificationService: NotificationService
  ) {
    this.investment = this.params.get('investment');
    this.oldValue = JSON.parse(JSON.stringify(this.params.get('investment')));
    this.checkForAdditions();
    _ = this;
    this.reload = this.params.get('reload');
    let sDate = new Date(this.investment.startDate);
    this.investment.startDate = sDate.getFullYear() + "-" + ("0" + (sDate.getMonth() + 1)).slice(-2) + "-" + ("0" + sDate.getDate()).slice(-2);
    //Check on maturity date
    if (this.investment.maturityDate && this.investment.maturityDate !== 'null') {
      let mDate = new Date(this.investment.maturityDate);
      this.investment.maturityDate = mDate.getFullYear() + "-" + ("0" + (mDate.getMonth() + 1)).slice(-2) + "-" + ("0" + mDate.getDate()).slice(-2);
    }

    if (this.investment.remindMe == 'true') {
      this.investment.remindMe = true;
    } else {
      this.investment.remindMe = false;
    }

    this.setMaxDate();
    this.historyService.fetchHistory(this.investment.name, (history) => {
      this.history = history;
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  checkForAdditions() {
    if (this.investment.addition) {
      this.addition = JSON.parse(JSON.stringify(this.investment.addition));
      this.oldAdd = JSON.parse(JSON.stringify(this.investment.addition));
      if (this.addition.tillDate && this.addition.tillDate !== 'null') {
        let aDate = new Date(this.addition.tillDate);
        this.addition.tillDate = aDate.getFullYear() + "-" + ("0" + (aDate.getMonth() + 1)).slice(-2);
      }
      delete this.investment.addition;
    } else {
      this.resetAddition();
    }

    if (this.investment.profitAddition) {
      this.profitAddition = JSON.parse(JSON.stringify(this.investment.profitAddition));
      this.oldProfitAdd = JSON.parse(JSON.stringify(this.investment.profitAddition));
      if (this.profitAddition.tillDate && this.profitAddition.tillDate !== 'null') {
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
      tillDate: null
    };
  }

  resetProfitAddition() {
    this.profitAddition = {
      name: '',
      profit: 0,
      period: 1,
      tillDate: null
    };
  }

  handleFormSubmit() {
    _.isError = false;
    if (Number(_.investment.loss) > Number(_.investment.totalAmount)) {
      _.errorMsg = "Umm.. Loss cannot be more than total investment amount *";
      _.isError = true;
    } else if (_.addition.amount && (!_.addition.period || Number(_.addition.period) <= 0)) {
      _.errorMsg = "Period for auto addition of invested amount cannot be 0 *";;
      _.isError = true;
    } else if (_.profitAddition.profit && (!_.profitAddition.period || Number(_.profitAddition.period) <= 0)) {
      _.errorMsg = "Period for auto addition of profit amount cannot be 0 *";
      _.isError = true;
    } else {
      _.isDisabled = true;
      let _investment = JSON.parse(JSON.stringify(_.investment));

      let _add = JSON.parse(JSON.stringify(_.addition));
      let _profitAdd = JSON.parse(JSON.stringify(_.profitAddition));

      let sDate = _investment.startDate.split('-');
      _investment.startDate = new Date(sDate[0], Number(sDate[1]) - 1, sDate[2]).getTime();

      //Check on maturity date
      if (_investment.maturityDate && _investment.maturityDate !== 'null') {
        let mDate = _investment.maturityDate.split('-');
        _investment.maturityDate = new Date(mDate[0], Number(mDate[1]) - 1, mDate[2]).getTime();
        //Check if nofification is needed
        if (_investment.remindMe) _investment.remindMe = 'true';
        else _investment.remindMe = 'false';
      } else {
        _investment.maturityDate = null;
        _investment.remindMe = 'false';
      }

      if (!_investment.notes) _investment.notes = '';

      _.sqlStorageService.updateInvestment(_investment.name, _investment)
        .then(() => {
          _.isDisabled = false;
          _.toastCtrl.create({
            message: "Your changes are saved",
            duration: 3000,
            position: 'bottom'
          }).present();

          //Set or remove notification if needed
          _.setOrRemoveNotifIfNeeded(_investment);

          //================SET ADDITION=================//
          if (!_.basic.isEqual(_.addition, _.oldAdd)) {
            if (_.addition.amount && Number(_.addition.amount) > 0) {
              _add.name = _investment.name;
              if (_add.tillDate) {
                let aDate = _add.tillDate.split('-');
                _add.tillDate = new Date(aDate[0], Number(aDate[1]) - 1).getTime();
              }

              _investment.addition = { ..._add };

              // A timeout as this update is not needed urgently and should
              // not affect UI changes
              setTimeout(() => {
                _.sqlStorageService.updateAddOrProfitAdd(_add, 'addition', _add.name)
                  .then(() => { 
                    console.log("UPDATED"); 
                    //Update history
                    _.historyService.addToAutoUpdatesInHistory(_investment.name, 'addition', _.addition, _.oldAdd);
                    _.resetAddition(); 
                  })
                  .catch((err) => { console.log("FAILED"); console.log(err); })
              }, 1000);
            } else {
              // A timeout as this update is not needed urgently and should
              // not affect UI changes
              setTimeout(() => {
                _.sqlStorageService.delAddOrProfitAdd('addition', _investment.name)
                  .then(() => { 
                    console.log("ADDITION DELETED"); 
                    //Update history
                    _.historyService.addToAutoUpdatesInHistory(_investment.name, 'addition', {}, _.oldAdd);
                  })
                  .catch((err) => { console.log("ADDITION DELETION FAILED"); console.log(err); })
              }, 1000);
            }
          }
          //=============================================//

          //============SET PROFIT-ADDITION==============//
          if (!_.basic.isEqual(_.profitAddition, _.oldProfitAdd)) {
            if (_.profitAddition.profit && Number(_.profitAddition.profit) > 0) {
              _profitAdd.name = _investment.name;
              if (_profitAdd.tillDate) {
                let aDate = _profitAdd.tillDate.split('-');
                _profitAdd.tillDate = new Date(aDate[0], Number(aDate[1]) - 1).getTime();
              }

              _investment.profitAddition = { ..._profitAdd };
              // A timeout as this update is not needed urgently and should
              // not affect UI changes
              _.sqlStorageService.updateAddOrProfitAdd(_profitAdd, 'profitAddition', _profitAdd.name)
                .then(() => {  
                  //Update history
                  _.historyService.addToAutoUpdatesInHistory(_investment.name, 'profitAddition', _.profitAddition, _.oldProfitAdd);
                  _.resetProfitAddition();
                })
                .catch((err) => { console.log(err); })
            } else {
              // A timeout as this update is not needed urgently and should
              // not affect UI changes
              _.sqlStorageService.delAddOrProfitAdd('profitAddition', _investment.name)
                .then(() => { 
                  console.log("PROFIT ADDITION DELETED"); 
                  //Update history
                  _.historyService.addToAutoUpdatesInHistory(_investment.name, 'profitAddition', {}, _.oldProfitAdd);
                })
                .catch((err) => { console.log("PROFIT ADDITION DELETION FAILED"); console.log(err); })
            }
          }
          //=============================================//

          //Update new investment in allInvestments
          _.utilService.updateInvestmentInMemory(_.sqlStorageService.allInvestments, _investment);
          _.utilService.emitChangeEvent();

          //Add to history
          _.historyService.addToHistory(_investment, _.oldValue, _.history);

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

  setMaxDate() {
    let today = new Date();
    this.maxDate = today.getFullYear() + "-" + ('0' + today.getMonth()).slice(-2) + "-" + ('0' + today.getDate()).slice(-2);
  }

  setOrRemoveNotifIfNeeded(investment) {
    if (investment.remindMe == 'false') {
      this.notificationService.clearNotification(investment.name);
    } else {
      this.notificationService.setNotification(investment.name, investment.name, "Hi! A reminder. This investment is maturing today.", (investment.maturityDate + (1000 * 60 * 60 * 7)), investment);
    }
  }
}