import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { PopoverController, ToastController } from 'ionic-angular';
import { PopoverPage } from '../../components/popover/popover.component';
import { FormComponent } from '../../components/investmentForm/investmentForm.component';
import { SQLStorageService } from '../../services/storage.service';
import { UtilService } from '../../services/util.service';
let _;

@Component({
  selector: 'page-add',
  templateUrl: 'addNew.html'
})
export class AddNewPage {
  public investment: any = {};
  public isError: boolean = false;
  public errorMsg: string = '';
  public maxDate: string = '';
  public isDisabled: boolean = false;
  
  constructor(
    public navCtrl: NavController, 
    public popoverCtrl: PopoverController,
    public sqlStorageService: SQLStorageService,
    public toastCtrl: ToastController,
    private utilService: UtilService
  ) {
    _ = this;
    this.resetInvestment();
    this.setMaxDate();
  }

  setMaxDate() {
    let today = new Date();
    this.maxDate = today.getFullYear() + "-" + ('0' + (today.getMonth() + 1)).slice(-2) + "-" + ('0' + today.getDate()).slice(-2);
  }

  resetInvestment() {
    this.investment = {
      name: '',
      type: '',
      totalAmount: '',
      startDate: '',
      profit: 0,
      loss: 0
    };
  }

  openPopover(ev) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
    	ev
    });
  }

  handleFormSubmit() {
    _.isError = false;
    if(Number(_.investment.loss) > Number(_.investment.totalAmount)) {
      _.errorMsg = "Umm.. Loss cannot be more than total investment amount *";
      _.isError = true;
    } else {
      _.isDisabled = true;
      let _investment = JSON.parse(JSON.stringify(_.investment));
      let sDate = _investment.startDate.split('-');
      _investment.startDate = new Date(sDate[0], Number(sDate[1])-1, sDate[2]).getTime();
      _.sqlStorageService.setInvestment(_investment)
      .then((response) => {
        _.isDisabled = false;
        _.resetInvestment();
        _.toastCtrl.create({
            message: "Good work! You just added an investment to your tracking list",
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
          _.utilService.emitChangeEvent();
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
}
