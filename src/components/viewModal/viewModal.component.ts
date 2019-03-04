import { Component, OnInit } from '@angular/core';
import { ViewController, NavParams, ModalController, AlertController, ToastController } from 'ionic-angular';
import { HistoryModal } from '../historyModal/historyModal.component';
import { EditModal } from '../editModal/editModal.component';
import { UtilService } from '../../shared/services/util.service';
import { SQLStorageService } from '../../shared/services/storage.service';
import { types } from '../../shared/data/data';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'view-modal',
  templateUrl: 'viewModal.html'
})
export class ViewModal implements OnInit {
  
  public investment: any = {};
  public index: number = 0;
  public typesObj: any = {};
  public deleteInv: Function;
  public isDisabled: boolean = false; //Disable all buttons while performing any operation
  public plDisplay: any = {
    text: "",
    class: "",
    percent: 0,
    isShow: true
  };

  constructor(
    public viewCtrl: ViewController,
    public utilService: UtilService,
    public params: NavParams,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public sqlStorageService: SQLStorageService,
    public toastCtrl: ToastController,
    private notificationService: NotificationService
  ) {
    this.investment = this.params.get('investment');
    this.index = this.params.get('index');
    this.deleteInv = this.params.get('deleteInv');
    this.calcLossOrProfit(this.investment);

    //MAKE KEY:VALUE FROM TYPES
    for(let i=0; i<types.length; i++) {
      this.typesObj[types[i].type] = types[i].name;
    }
  }

  ngOnInit() {
    this.utilService.onInvChange.subscribe(() => { 
      this.investment.remindMe = 'false';
    });
  }

  getDate(date, onlyMY?) {
    return this.utilService.getDate(date, true, onlyMY);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getTheme() {
    return this.utilService.theme || 'primary';
  }

  edit() {
    this.dismiss();
    let editModal = this.modalCtrl.create(EditModal, { 
      investment: JSON.parse(JSON.stringify(this.investment))
    });

    editModal.present();
  }

  delete() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure ?',
      message: '',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            //DO NOTHING
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.dismiss();
            this.deleteInv(this.investment, this.index);
          }
        }
      ]
    });
    confirm.present();
  }

  history() {
    let historyModal = this.modalCtrl.create(HistoryModal, { 
      investment: JSON.parse(JSON.stringify(this.investment))
    });

    historyModal.present();
  }

  remindMe() {
    this.isDisabled = true; 
    let investment = JSON.parse(JSON.stringify(this.investment));
    investment.remindMe = investment.remindMe == 'true' ? 'false' : 'true';
    //DELETE ADDITION & PROFIT ADDITION
    delete investment.addition;
    delete investment.profitAddition;

    this.sqlStorageService.updateInvestment(investment.name, investment)
    .then((response) => {
      this.setOrRemoveNotifIfNeeded(investment);
      this.investment.remindMe = investment.remindMe;
      this.reload(this.investment);
      this.isDisabled = false;
      this.toastCtrl.create({
        message: investment.remindMe == 'true' ? "You will get notified on maturity date" : "Reminder is deleted",
        duration: 3000,
        position: 'bottom'
      }).present();
    })
    .catch((err) => {
      this.isDisabled = false;
      console.log(err);
      //SHOW TOAST
      this.toastCtrl.create({
        message: "Oops! Looks like something isn't right, try closing the app and reopen",
        duration: 3000,
        position: 'bottom'
      }).present();
    })
  }

  setOrRemoveNotifIfNeeded(investment) {
    if(investment.remindMe == 'false') {
      this.notificationService.clearNotification(investment.name);
    } else {
      this.notificationService.setNotification(investment.name, investment.name, "Hi! A reminder. This investment is maturing today.", (investment.maturityDate + (1000 * 60 * 60 * 7)), investment);
    }
  }

  reload(inv) {
    for(let i=0; i< this.sqlStorageService.allInvestments.length; i++) {
      if(this.sqlStorageService.allInvestments[i].name == inv.name) {
        this.sqlStorageService.allInvestments[i].remindMe = inv.remindMe;
        this.utilService.emitChangeEvent();
        break;
      }
    }
  }

  isMaturityDatePassed() {
    if(this.investment.maturityDate) {
      let tomorrow: any = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      tomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).getTime();
      return (this.investment.maturityDate < tomorrow);
    } else {
      return false;
    }
  }

  calcLossOrProfit(inv) {
    if(inv.profit > inv.loss) {
      this.plDisplay.text = "Profit Percent";
      this.plDisplay.class = "profit-text";
      this.plDisplay.percent = (((inv.profit - inv.loss) * 100) / inv.totalAmount).toFixed(2);
    } else if(inv.profit < inv.loss) {
      this.plDisplay.text = "Loss Percent";
      this.plDisplay.class = "loss-text";
      this.plDisplay.percent = (((inv.loss - inv.profit) * 100) / inv.totalAmount).toFixed(2);
    } else {
      this.plDisplay.isShow = false;
    }
  }
}