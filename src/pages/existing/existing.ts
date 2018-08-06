import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { PopoverController, AlertController, List, ToastController, ModalController } from 'ionic-angular';
import { PopoverPage } from '../../components/popover/popover.component';
import { EditModal } from '../../components/editModal/editModal.component';
import { CalcModal } from '../../components/calcModal/calcModal.component';
import { HistoryModal } from '../../components/historyModal/historyModal.component';
import { ViewModal } from '../../components/viewModal/viewModal.component';
import { types } from '../../data/data';
import { SQLStorageService } from '../../services/storage.service';
import { UtilService } from '../../services/util.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'page-existing',
  templateUrl: 'existing.html'
})
export class ExistingPage implements OnInit {
  @ViewChild(List) list: List;
  public typesObj = {};
  public investments: any = [];

  public selInvestment: any = {};
  private callCount = 0;
  public selectedCurr = localStorage.currency ? JSON.parse(localStorage.currency) : { name: 'USD', symbol: '$' }

  constructor(
    public navCtrl: NavController, 
    public popoverCtrl: PopoverController, 
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController, 
    public modalCtrl: ModalController,
    private file: File,
    public sqlStorageService: SQLStorageService,
    public utilService: UtilService,
    public currencyService: CurrencyService
  ) {
    //MAKE KEY:VALUE FROM TYPES
    for(let i=0; i<types.length; i++) {
      this.typesObj[types[i].type] = types[i].name;
    }
  }

  ionViewDidEnter() {
    if(this.utilService.showHelpToast) {
      this.utilService.showHelpToast = false;
      this.showHelpToast();
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
        this.showErrorToast();
    })


    //SUBSCRIBE TO RELOAD
    this.utilService.onChange.subscribe({
      next: () => {
        this.reload(true);
      }
    })
  }

  ngOnInit() {
    this.initiate();
    this.currencyService.changeCurrency.subscribe(() => {
       this.selectedCurr = JSON.parse(localStorage.currency);
    })
  }
  
  reload(notThisView?) {
    this.investments = this.sqlStorageService.allInvestments;
    if(notThisView) {
      this.utilService.showHelpToast = true;
      return;
    }

    this.showHelpToast();
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
            this.deleteInv(investment, i);
          }
        }
      ]
    });
    confirm.present();
  }

  deleteInv = (investment, i) => {
    //DELETE FROM SQLITE & REPOPULATE LIST
    this.sqlStorageService.delInvestment(investment.name)
    .then(() => {
      this.investments.splice(i, 1);
      this.sqlStorageService.allInvestments = JSON.parse(JSON.stringify(this.investments));
      let toastDel = this.toastCtrl.create({
        message: 'Deleted from your list',
        duration: 3000,
        position: 'bottom'
      });
      toastDel.present();
      //INVOKE EVENT EMITTER
      this.utilService.emitChangeEvent();
      this.utilService.clearNotification(investment.name);

      //REMOVE FROM HISTORY TABLE
      this.sqlStorageService.delHistory(investment.name)
      .then(() => { console.log("Deleted..."); })
      .catch((err) => { console.log(err); })
    })
    .catch((err) => {
      this.showErrorToast();
    });
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
    return (investment.profit > investment.loss) ? 'TRUE' : (investment.profit < investment.loss ? 'FALSE' : 'NONE');
  }

  getLossPer(investment) {
    return '-' + ((investment.loss-investment.profit)/investment.totalAmount * 100).toFixed(2) + '%';
  }

  getProfitPer(investment) {
    return '+' + ((investment.profit - investment.loss)/investment.totalAmount * 100).toFixed(2) + '%';
  }

  exportCSV() {
    let headers = ["Type", "Total Investment Amount", "Profit", "Loss", "Start Date"];
    let csv = '';
    csv += headers.join(",") + '\r\n';

    for (var i = 0; i < this.investments.length; i++) {
        var row = "";
        row += '"' + this.typesObj[this.investments[i]['type']] + '",';
        row += '"' + this.investments[i]['totalAmount'] + '",';
        row += '"' + this.investments[i]['profit'] + '",';
        row += '"' + this.investments[i]['loss'] + '",';
        let date = new Date(Number(this.investments[i]['startDate']));
        row += '"' + (('0' + date.getDate()).slice(-2)) + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + date.getFullYear() + '",';

        row.slice(0, row.length - 1);
        csv += row + '\r\n';
    }

    this.file.createDir(this.file.externalRootDirectory, 'Investment Tracker', false)
    .then(() => {
      this.createFile(csv);
    })
    .catch((err) => {
      if(err.message == "PATH_EXISTS_ERR") {
        this.createFile(csv);
      } else {
          this.showErrorToast();
      }
    })
  }

  createFile(csv) {
    let fileName = 'Investments.csv';
    let path = this.file.externalRootDirectory + "/Investment Tracker";
    let bool: any = true;
    this.file.writeFile(path, fileName, csv, bool)
    .then(() => {
      this.fileDownloadSuccess();
    })
    .catch((err) => {
      this.file.writeExistingFile(path, fileName, csv)
      .then(() => {
        this.fileDownloadSuccess();
      })
      .catch((err) => {
        console.log(err);
        this.showErrorToast();
      })
    })
  }

  fileDownloadSuccess() {
    this.toastCtrl.create({
      message: "File downloaded in `Investment Tracker` folder as `Investments.csv`",
      duration: 3000,
      position: 'bottom'
    }).present(); 
  }

  showErrorToast() {
    this.toastCtrl.create({
      message: "Oops! Looks like something isn't right, try closing the app and reopen",
      duration: 3000,
      position: 'bottom'
    }).present(); 
  }

  showHelpToast() {
    if(this.investments.length) {
      let count = window.localStorage.infoCount ? +window.localStorage.infoCount : 0;
      if(count < 3) {
        window.localStorage.infoCount = count + 1;
        this.toastCtrl.create({
          message: "Click item for a QUICK VIEW or swipe to EDIT or DELETE",
          duration: 3000,
          position: 'bottom'
        }).present();
      } 
    }
  }

  showHistory(investment) {
    this.list.closeSlidingItems();
    let historyModal = this.modalCtrl.create(HistoryModal, { 
      investment: JSON.parse(JSON.stringify(investment))
    });

    historyModal.present();
  }

  quickView(investment, i) {
    let viewModal = this.modalCtrl.create(ViewModal, {
      investment: JSON.parse(JSON.stringify(investment)),
      index: i,
      deleteInv: this.deleteInv
    });

    viewModal.present();
  }
}
