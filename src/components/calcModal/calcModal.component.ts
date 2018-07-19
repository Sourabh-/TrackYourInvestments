import { Component, OnInit } from '@angular/core';
import { ViewController, AlertController, ToastController } from 'ionic-angular';
import { UtilService } from '../../services/util.service';
import { CurrencyService } from '../../services/currency.service';

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
    public currencyService: CurrencyService
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
    let alert = this.alertCtrl.create({
      title: 'Calculator Help',
      subTitle: `<p><b>SIP Calculator-</b> Easily calculate returns on your SIP for a specific period with an expected rate of return</p>
                 <p><b>Lumpsum Calculator-</b> Find the future value of an investment assuming growth at a constant rate</p>
                 <p><b>Profit/Loss Calculator-</b> Calculate profit or loss on your investment</p>`,
      buttons: ['OK']
    });
    alert.present();
  }

  changeCalc(ev) {
    this.calcObj = {};
    this.isShow = false;
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
     } else {
       this.result['expectedAmt'] = Math.round(this.calcObj.amount * Math.pow((1 + this.calcObj.interest/100), this.calcObj.period));
       this.result['amtInvested'] = Math.round(this.calcObj.amount);
       this.result['profit'] = Math.round(this.result['expectedAmt'] - this.result['amtInvested']); 
       this.result['absoluteReturn'] = ((this.result['profit'] / this.result['amtInvested']) * 100).toFixed(2);
     }

     this.isShow = true;
  }
}