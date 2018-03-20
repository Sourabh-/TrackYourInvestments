import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { PopoverController, AlertController, List, ToastController, ModalController } from 'ionic-angular';
import { PopoverPage } from '../../components/popover/popover.component';
import { EditModal } from '../../components/editModal/editModal.component';
import { types } from '../../data/data';
import { SQLStorageService } from '../../services/storage.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'page-existing',
  templateUrl: 'existing.html'
})
export class ExistingPage implements OnInit {
  @ViewChild(List) list: List;
  public typesObj = {};
  public investments: any = [];

  public selInvestment: any = {};
  public toastDel: any;
  private callCount = 0;

  constructor(
    public navCtrl: NavController, 
    public popoverCtrl: PopoverController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public modalCtrl: ModalController,
    public sqlStorageService: SQLStorageService,
    public utilService: UtilService
  ) {
    this.toastDel = this.toastCtrl.create({
      message: 'Deleted successfully',
      duration: 3000,
      position: 'bottom'
    });

    //MAKE KEY:VALUE FROM TYPES
    for(let i=0; i<types.length; i++) {
      this.typesObj[types[i].type] = types[i].name;
    }
  }

  initiate() {
    //GET ALL INVESTMENTS
    this.sqlStorageService.getInvestments()
    .then((response) => {
      if(response.rows.length) {
        let _invs = [];
        for(let i=0; i<response.rows.length; i++) {
          _invs.push(response.rows.item(i));
        }

        this.sqlStorageService.allInvestments = _invs;
      }

      this.reload();
    })
    .catch((err) => {
      console.log(err);
      if(err.message === 'DB NOT READY' && this.callCount != 10) {
        this.callCount++;
        setTimeout(() => { this.ngOnInit(); }, 200);
      } else 
        this.toastCtrl.create({
          message: "Oops! Looks like something isn't right, try closing the app and reopen",
          duration: 3000,
          position: 'bottom'
        }).present();
    })


    //SUBSCRIBE TO RELOAD
    this.utilService.onChange.subscribe({
      next: () => {
        this.reload();
      }
    })
  }

  ngOnInit() {
    this.initiate();
  }
  
  reload() {
    this.investments = this.sqlStorageService.allInvestments;
  }

  openPopover(ev) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
    	ev
    });
  }

  confirmDelInvestment(investment, i) {
    this.list.closeSlidingItems();
    //SHOW CONFIRM
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
            //DELETE FROM SQLITE & REPOPULATE LIST
            this.sqlStorageService.delInvestment(investment.name)
            .then(() => {
              this.investments.splice(i, 1);
              this.sqlStorageService.allInvestments = JSON.parse(JSON.stringify(this.investments));
              this.toastDel.present();
              //INVOKE EVENT EMITTER
              this.utilService.emitChangeEvent();
            })
            .catch((err) => {
              this.toastCtrl.create({
                message: "Oops! Looks like something isn't right, try closing the app and reopen",
                duration: 3000,
                position: 'bottom'
              }).present();
            });
          }
        }
      ]
    });
    confirm.present();
  }

  editInvestment(investment, i) {
    this.list.closeSlidingItems();
    //OPEN MODAL WITH PRE-FILLED INVESTMENT DETAILS TO BE EDITED
    this.selInvestment = investment;
    let editModal = this.modalCtrl.create(EditModal, { 
      investment: JSON.parse(JSON.stringify(investment))
    });

    editModal.present();
  }

  isProfit(investment) {
    return (investment.profit > investment.loss);
  }

  getLossPer(investment) {
    return '-' + ((investment.loss-investment.profit)/investment.totalAmount * 100).toFixed(2) + '%';
  }

  getProfitPer(investment) {
    return '+' + ((investment.profit - investment.loss)/investment.totalAmount * 100).toFixed(2) + '%';
  }
}
