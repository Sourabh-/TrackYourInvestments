import { Component, OnInit } from '@angular/core';
import { ViewController, AlertController, ToastController, ModalController } from 'ionic-angular';
import { UtilService } from '../../shared/services/util.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { CalcHelpModal } from '../calcHelpModal/calcHelpModal.component';

@Component({
  selector: 'calc-modal',
  templateUrl: 'calcModal.html'
})
export class CalcModal implements OnInit {

  public calculator: string = 'sip';
  public calcObj: any = {};
  public result: any = {};
  public isShow: boolean = false;
  public selectedCurr = localStorage.currency ? JSON.parse(localStorage.currency) : { name: 'USD', symbol: '$' };
  
  constructor(
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public utilService: UtilService,
    public currencyService: CurrencyService,
    public modalCtrl: ModalController
  ) {

  }

  ngOnInit() {
    this.currencyService.changeCurrency.subscribe(() => {
       this.selectedCurr = JSON.parse(localStorage.currency);
    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getTheme() {
    return this.utilService.theme || 'primary';
  }

  showInfo() {
    let modal = this.modalCtrl.create(CalcHelpModal);
    modal.present();
  }

  changeCalc(ev) {
    this.calcObj = {};
    this.isShow = false;
    if(ev == 'ppf') {
      this.calcObj.period = 15;
      this.calcObj.interest = 7.6;
    }
  }

  checkIfZero() {
    if(this.calculator !== 'pl') {
      return (this.calcObj.amount == 0 || this.calcObj.interest == 0 || this.calcObj.period == 0);
    } else {
      return (this.calcObj.sellingPrice == 0 || this.calcObj.costPrice == 0);
    }
  }

  calculate() {
     this.result = {};

     if(this.checkIfZero()) {
       this.isShow = false;
       return this.toastCtrl.create({
          message: "Sorry, value cannot be zero",
          duration: 3000,
          position: 'bottom'
       }).present();
     } else if(this.calculator == 'sip') {
       this.result['expectedAmt'] = Math.round(this.calcObj.amount * (Math.pow(1 + (this.calcObj.interest/12/100), (this.calcObj.period * 12)) - 1) * (1 + (this.calcObj.interest/12/100)) / (this.calcObj.interest/12/100));
       this.result['amtInvested'] = Math.round(this.calcObj.amount * this.calcObj.period * 12);
       this.result['profit'] = Math.round(this.result['expectedAmt'] - this.result['amtInvested']); 
       this.result['absoluteReturn'] = ((this.result['profit'] / this.result['amtInvested']) * 100).toFixed(2);
     } else if(this.calculator == 'rd') {
       this.result['expectedAmt'] = Math.round(this.calcObj.amount * (Math.pow((1 + this.calcObj.interest/400), this.calcObj.period * 4) - 1)/(1 - Math.pow((1 + this.calcObj.interest/400), (-1/3))));
       this.result['amtInvested'] = Math.round(this.calcObj.amount * this.calcObj.period * 12);
       this.result['profit'] = Math.round(this.result['expectedAmt'] - this.result['amtInvested']); 
       this.result['absoluteReturn'] = ((this.result['profit'] / this.result['amtInvested']) * 100).toFixed(2);
     } else if(this.calculator == 'pl') {
       this.result['expectedAmt'] = Math.round(this.calcObj.sellingPrice);
       this.result['amtInvested'] = Math.round(this.calcObj.costPrice);

       if(this.result['expectedAmt'] > this.result['amtInvested']) {
         this.result['profit'] = this.result['expectedAmt'] - this.result['amtInvested'];
         this.result['absoluteReturn'] = (((this.result['expectedAmt'] - this.result['amtInvested'])/this.result['amtInvested']) * 100).toFixed(2);
         this.result['isProfit'] = true;
       } else if(this.result['expectedAmt'] < this.result['amtInvested']) {
         this.result['loss'] = this.result['amtInvested'] - this.result['expectedAmt'];
         this.result['absoluteReturn'] = '-' + (((this.result['amtInvested'] - this.result['expectedAmt'])/this.result['amtInvested']) * 100).toFixed(2);
         this.result['isProfit'] = false;
       } else {
         this.result['profit'] = 0;
         this.result['loss'] = 0;
         this.result['absoluteReturn'] = 0;
         this.result['isProfit'] = true;
       }
     } else if(this.calculator == 'plemi' || this.calculator == 'hemi') {
       let emi = this.calcObj.amount * (this.calcObj.interest/12/100) * Math.pow((1 + (this.calcObj.interest/12/100)), (this.calcObj.period * 12)) / (Math.pow((1 + (this.calcObj.interest/12/100)), (this.calcObj.period * 12)) - 1);
       this.result['emi'] = Math.round(emi);
       this.result['amtInvested'] = Math.round(this.calcObj.amount);
       this.result['expectedAmt'] = Math.round(emi * this.calcObj.period * 12);
       this.result['interestPayable'] = this.result['expectedAmt'] - this.result['amtInvested'];
     } else if(this.calculator == 'fd') {
       this.result['expectedAmt'] = Math.round(this.calcObj.amount * Math.pow((1 + this.calcObj.interest/400), this.calcObj.period * 4));
       this.result['amtInvested'] = Math.round(this.calcObj.amount);
       this.result['profit'] = Math.round(this.result['expectedAmt'] - this.result['amtInvested']); 
       this.result['absoluteReturn'] = ((this.result['profit'] / this.result['amtInvested']) * 100).toFixed(2);
     } else if(this.calculator == 'ppf') {
       this.result['expectedAmt'] = Math.round(this.calcObj.amount * (Math.pow(1 + (this.calcObj.interest/100), (this.calcObj.period)) - 1) * (1 + (this.calcObj.interest/100)) / (this.calcObj.interest/100));
       this.result['amtInvested'] = Math.round(this.calcObj.amount * this.calcObj.period);
       this.result['profit'] = Math.round(this.result['expectedAmt'] - this.result['amtInvested']); 
       this.result['absoluteReturn'] = ((this.result['profit'] / this.result['amtInvested']) * 100).toFixed(2);
     } else if(this.calculator == 'ret') {
       this.result["timeToRet"] = this.calcObj.rage - this.calcObj.age;
       this.result['retYears'] = this.calcObj.expectancy - this.calcObj.rage;
       var curr_val = (this.calcObj.mexpense * 12);
       var monthlyRate = (this.calcObj.inflation / 100);
       var power = Math.pow((1 + monthlyRate), this.result["timeToRet"]);
       this.result['annualExp'] = (curr_val * power).toFixed(0);
       var inflation_during_retire_years = 7;
       var inv_ret_corpus = 9;
       var net_returns = ((1+(inv_ret_corpus/100))/(1+(inflation_during_retire_years/100))-1);
       var pv = this.calcPv(net_returns, (20), 0, this.result['annualExp'], 1);
       this.result['expectedAmt'] = pv.toFixed(0);
       this.result['monthlyExp'] = Math.round(this.result['annualExp']/12);
     } else {
       this.result['expectedAmt'] = Math.round(this.calcObj.amount * Math.pow((1 + this.calcObj.interest/100), this.calcObj.period));
       this.result['amtInvested'] = Math.round(this.calcObj.amount);
       this.result['profit'] = Math.round(this.result['expectedAmt'] - this.result['amtInvested']); 
       this.result['absoluteReturn'] = ((this.result['profit'] / this.result['amtInvested']) * 100).toFixed(2);
     }

     this.isShow = true;
  }

  calcPv(rate, periods, payment, future, type) {
    var pow = Math.pow(1 + rate, (periods + 1)) - (1 + rate);
    var pow1 = (rate * Math.pow(1 + rate, periods));
    var pv = (future * (pow/pow1));
    return pv;
  }
}