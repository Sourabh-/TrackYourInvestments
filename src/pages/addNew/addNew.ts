import { Component } from '@angular/core';
import { NavController, PopoverController, ToastController, ModalController, Nav, Tabs } from 'ionic-angular';
import { DashboardPage } from '../dashboard/dashboard';
import { PopoverPage } from '../../components/popover/popover.component';
import { FormComponent } from '../../components/investmentForm/investmentForm.component';
import { CalcModal } from '../../components/calcModal/calcModal.component';
import { SQLStorageService } from '../../services/storage.service';
import { UtilService } from '../../services/util.service';
let _;

@Component({
  selector: 'page-add',
  templateUrl: 'addNew.html'
})
export class AddNewPage {
  public investment: any = {};
  public addition: any = {}; //Monthly addition
  public profitAddition: any = {};
  public isError: boolean = false;
  public errorMsg: string = '';
  public maxDate: string = '';
  public isDisabled: boolean = false;
  private tabs: Tabs;
  
  constructor(
    public navCtrl: NavController, 
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public sqlStorageService: SQLStorageService,
    public toastCtrl: ToastController,
    private utilService: UtilService,
    private nav: Nav
  ) {
    _ = this;
    this.resetInvestment();
    this.resetAddition();
    this.resetProfitAddition();
    this.setMaxDate();
    this.tabs = this.navCtrl.parent;
  }

  setMaxDate() {
    let today = new Date();
    this.maxDate = today.getFullYear() + "-" + ('0' + (today.getMonth() + 1)).slice(-2) + "-" + ('0' + today.getDate()).slice(-2);
  }

  reset = (type) => {
    switch (type) {
      case "inv":
        this.resetInvestment();
        break;
      case "add":
        this.resetAddition();
        break;
      case "pro":
        this.resetProfitAddition();
        break;
    }
  }

  resetInvestment() {
    this.investment = {
      name: '',
      type: '',
      totalAmount: '',
      startDate: '',
      profit: 0,
      loss: 0,
      notes: null,
      remindMe: false,
      maturityDate: null
    };
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

  openPopover(ev) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
    	ev
    });
  }

  openCalc() {
    let calcMdl = this.modalCtrl.create(CalcModal);
    calcMdl.present();
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
      if(_investment.maturityDate) {
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

      _.sqlStorageService.setInvestment(_investment)
      .then((response) => {
        _.isDisabled = false;
        _.resetInvestment();
        _.toastCtrl.create({
            message: "Good work! You just added an investment to your tracking list.",
            duration: 3000,
            position: 'bottom'
        }).present();

        //Set notification if required
        _.setNotifIfNeeded(_investment);

        setTimeout(() => {
          //================SET ADDITION=================//
          if(_.addition.amount && Number(_.addition.amount) > 0) {
            _add.name = _investment.name;
            if(_add.tillDate) {
              let aDate = _add.tillDate.split('-');
              _add.tillDate = new Date(aDate[0], Number(aDate[1])-1).getTime();
            }

            _.sqlStorageService.setAddOrProfitAdd(_add, 'addition')
            .then(() => { console.log("ADDED"); _.resetAddition();  }).catch((err) => { console.log("FAILED"); console.log(err); })
          }
          //=============================================//

          //============SET PROFIT-ADDITION==============//
          if(_.profitAddition.profit && Number(_.profitAddition.profit) > 0) {
            _profitAdd.name = _investment.name;
            if(_profitAdd.tillDate) {
              let aDate = _profitAdd.tillDate.split('-');
              _profitAdd.tillDate = new Date(aDate[0], Number(aDate[1])-1).getTime();
            }

            _.sqlStorageService.setAddOrProfitAdd(_profitAdd, 'profitAddition')
            .then(() => { _.resetProfitAddition(); }).catch((err) => { console.log(err); })
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
          _.utilService.emitChangeEvent();
          setTimeout(() => {
            //Navigate to dashboard
            _.tabs.select(0);
          }, 2500);
        })
        .catch((err) => {
          console.log(err);
          //SHOW TOAST
          _.toastCtrl.create({
            message: "Oops! Looks like something isn't right, try closing the app and reopen",
            duration: 3000,
            position: 'bottom'
          }).present();
        })
      })
      .catch((err) => {
        _.isDisabled = false;
        console.log(err);
        if(typeof err == 'object' && err.message == 'sqlite3_step failure: UNIQUE constraint failed: investments.name') {
          //SHOW NAME EXISTS TOAST
          _.toastCtrl.create({
            message: "Oops! This name seems to exist in your list",
            duration: 3000,
            position: 'bottom'
          }).present();
        } else {
          _.toastCtrl.create({
            message: "Oops! Looks like something isn't right, try closing the app and reopen",
            duration: 3000,
            position: 'bottom'
          }).present();
        }
      })
    }
  }

  setNotifIfNeeded(investment) {
    if(investment.remindMe == 'true') {
      this.utilService.setNotification(investment.name, investment.name, "Hi! A reminder. This investment is maturing today.", (investment.maturityDate + (1000 * 60 * 60 * 7)), investment);
    }
  }
}
