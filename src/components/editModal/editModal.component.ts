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
    _ = this;
    this.reload = this.params.get('reload');
    let sDate = new Date(this.investment.startDate);
  	this.investment.startDate = sDate.getFullYear() + "-" + ("0" + (sDate.getMonth()+1)).slice(-2) + "-" + ("0" + sDate.getDate()).slice(-2);
    this.setMaxDate();
  }

  dismiss() {
    this.viewCtrl.dismiss();
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
}