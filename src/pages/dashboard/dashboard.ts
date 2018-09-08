import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import Chart from 'chart.js';
import { PopoverController, ToastController } from 'ionic-angular';
import { PopoverPage } from '../../components/popover/popover.component';
import { CalcModal } from '../../components/calcModal/calcModal.component';
import { UtilService } from '../../services/util.service';
import { SQLStorageService } from '../../services/storage.service';
import { CurrencyService } from '../../services/currency.service';
import { categories } from '../../data/data';

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage implements OnInit {
  @ViewChild('bar') bar: ElementRef;
  @ViewChild('pie') pie: ElementRef;
  @ViewChild('profitLoss') pl: ElementRef;
  @ViewChild('profitonly') po: ElementRef;
  @ViewChild('lossonly') lo: ElementRef;
  @ViewChild('asset') as: ElementRef;

  public barChart: any;
  public pieChart: any;
  public plChart: any;
  public poChart: any;
  public loChart: any;
  public asChart: any;
  public isLoading: boolean = true;
  public noData: boolean = false;
  public totalInvestedAmt = 0;
  public profit = 0;
  public profitPercent:any = 0;
  public loss = 0;
  public lossPercent:any = 0;
  private callCount = 0;
  public selectedCurr = localStorage['currency'] ? JSON.parse(localStorage['currency']) : { name: 'USD', symbol: '$' };
  public showLossMsg: boolean = false;
  public showProfitMsg: boolean = false;

  constructor(
    public navCtrl: NavController, 
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    private utilService: UtilService,
    public sqlStorageService: SQLStorageService,
    public toastCtrl: ToastController,
    public currencyService: CurrencyService
  ) {

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
        this.setBarChart();
        this.setPieChart();
        this.setProfitLossChart();
        this.setProfitPieChart();
        this.setLossPieChart();
        this.setAssetPieChart();
        this.calcInvestment();
      } else {
        //SHOW NO DATA SCREEN
        this.noData = true;
      }

      this.isLoading = false;
    })
    .catch((err) => {
      console.log(err.message);
      if(err.message === 'DB NOT READY' && this.callCount != 10) {
        this.callCount++;
        setTimeout(() => { this.initiate(); }, 200);
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
    });
  }

  ngOnInit() {
     this.initiate(); 
     this.currencyService.changeCurrency.subscribe(() => {
       this.selectedCurr = JSON.parse(localStorage['currency']);
       this.reload();
     });

     this.utilService.onThemeChange.subscribe(() => {
       this.reload();
     })
  }

  reload() {
    if(this.sqlStorageService.allInvestments.length) {
      this.noData = false;
      this.totalInvestedAmt = 0;
      this.profit = 0;
      this.profitPercent = 0;
      this.loss = 0;
      this.lossPercent = 0;

      this.calcInvestment();
      this.setBarChart();
      this.setPieChart();
      this.setProfitLossChart();
      this.setProfitPieChart();
      this.setLossPieChart();
      this.setAssetPieChart();
    } else {
      this.noData = true;
    }
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

  setBarChart() {
    let barCtx = this.bar.nativeElement.getContext('2d');
    let lbls = [], data = [], bColors = [];

    this.sqlStorageService.allInvestments.map((inv, i) => {
      lbls.push(inv.name);
      data.push(inv.totalAmount);
      bColors.push(this.utilService.getThemeBasedColor(i));
    });

    try { this.barChart.destroy() } catch(e) { console.log(e); }
    this.barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: lbls,
          datasets: [{
              label: 'Total Invested Amount',
              data,
              borderWidth: 1,
              backgroundColor: bColors
          }]
        },
        options: {
            responsive: true,
            legend: {
                onClick: (e) => e.stopPropagation()
            },
            scales: {
                xAxes: [{
                    categoryPercentage: 1.0,
                    barPercentage: 1.0,
                    ticks: {
                      autoSkip: false
                    }
                }],
                yAxes: [{
                    ticks: {
                      beginAtZero: true
                    }
                }]
            },
            tooltips: {
              enabled: true,
              mode: 'single',
              callbacks: {
                  label: (tooltipItems, data) => { 
                      return 'Invested Amount: ' + this.selectedCurr.symbol + Math.abs(Number(data.datasets[0].data[tooltipItems.index]));
                  }
              }
            }
        }
    });
  }

  setPieChart() {
    let pieCtx = this.pie.nativeElement.getContext('2d');
    let lbls = [], tempData = [], data = [], bColors = [], ta = 0;

    this.sqlStorageService.allInvestments.map((inv, i) => {
      lbls.push(inv.name);
      tempData.push(inv.totalAmount);
      bColors.push(this.utilService.getThemeBasedColor(i));
      ta += inv.totalAmount;
    });

    tempData.map((val) => {
      data.push(((val*100)/ta).toFixed(2));
    });

    try { this.pieChart.destroy() } catch(e) { console.log(e); }
    this.pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: lbls,
          datasets: [{
              data,
              borderWidth: 1,
              backgroundColor: bColors
          }]
        },
        options: {
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: function(tooltipItems, data) { 
                    return data.labels[tooltipItems.index] + ': ' + data.datasets[0].data[tooltipItems.index] + "%";
                }
            }
          }
        }
    });
  }

  setProfitLossChart() {
    let plCtx = this.pl.nativeElement.getContext('2d');
    let lbls = [], data = [], bColors = [];

    this.sqlStorageService.allInvestments.map((inv) => {
      lbls.push(inv.name);
      if(inv.profit > inv.loss) {
        data.push(inv.profit - inv.loss);
        bColors.push(this.utilService.getProfitColor());
      } else if(inv.profit < inv.loss) {
        data.push(inv.profit - inv.loss);
        bColors.push(this.utilService.getLossColor());
      } else {
        data.push(0);
        bColors.push(this.utilService.getZeroColor());
      }
    });

    try { this.plChart.destroy() } catch(e) { console.log(e); }
    this.plChart = new Chart(plCtx, {
        type: 'bar',
        data: {
          labels: lbls,
          datasets: [{
              label: 'Profit & Loss',
              data,
              borderWidth: 1,
              backgroundColor: bColors
          }]
        },
        options: {
          responsive: true,
          legend: {
              onClick: (e) => e.stopPropagation()
          },
          scales: {
              xAxes: [{
                  categoryPercentage: 1.0,
                  barPercentage: 1.0,
                  ticks: {
                    autoSkip: false
                  }
              }],
              yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
              }]
          },
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: (tooltipItems, data) => { 
                  if(Number(data.datasets[0].data[tooltipItems.index]) < 0)
                    return 'Loss: ' + this.selectedCurr.symbol + Math.abs(Number(data.datasets[0].data[tooltipItems.index]));
                  else
                    return 'Profit: ' + this.selectedCurr.symbol + data.datasets[0].data[tooltipItems.index];
                }
            }
          }
        }
    });
  }

  setProfitPieChart() {
    let poCtx = this.po.nativeElement.getContext('2d');
    let lbls = [], data = [], bColors = [], ta = 0;
    let totalProfit = 0;
    let cnt = 0;
    this.sqlStorageService.allInvestments.map((inv) => {
      if(inv.profit > inv.loss) {
        totalProfit += (inv.profit - inv.loss);
        lbls.push(inv.name);
        data.push(inv.profit - inv.loss);
        bColors.push(this.utilService.getThemeBasedColor(cnt));
        cnt++;
      }
    });

    for(let i=0; i < data.length; i++) {
      data[i] = ((data[i] * 100) / totalProfit).toFixed(2);
    }

    try { this.poChart.destroy() } catch(e) { console.log(e); }

    if(data.length) {
      this.showProfitMsg = false;
      this.poChart = new Chart(poCtx, {
        type: 'pie',
        data: {
          labels: lbls,
          datasets: [{
              data,
              borderWidth: 1,
              backgroundColor: bColors
          }]
        },
        options: {
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: function(tooltipItems, data) { 
                    return data.labels[tooltipItems.index] + ': ' + data.datasets[0].data[tooltipItems.index] + "%";
                }
            }
          }
        }
    });
    } else {
      this.showProfitMsg = true;
    }
  }

  setLossPieChart() {
    let loCtx = this.lo.nativeElement.getContext('2d');
    let lbls = [], data = [], bColors = [], ta = 0;
    let totalLoss = 0;
    let cnt = 0;

    this.sqlStorageService.allInvestments.map((inv) => {
      if(inv.profit < inv.loss) {
        totalLoss += (inv.loss - inv.profit);
        lbls.push(inv.name);
        data.push(inv.loss - inv.profit);
        bColors.push(this.utilService.getThemeBasedColor(cnt));
        cnt++;
      }
    });

    for(let i=0; i < data.length; i++) {
      data[i] = ((data[i] * 100) / totalLoss).toFixed(2);
    }

    try { this.loChart.destroy() } catch(e) { console.log(e); }

    if(data.length) {
      this.showLossMsg = false;
      this.loChart = new Chart(loCtx, {
        type: 'pie',
        data: {
          labels: lbls,
          datasets: [{
              data,
              borderWidth: 1,
              backgroundColor: bColors
          }]
        },
        options: {
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: function(tooltipItems, data) { 
                    return data.labels[tooltipItems.index] + ': ' + data.datasets[0].data[tooltipItems.index] + "%";
                }
            }
          }
        }
    });
    } else {
      this.showLossMsg = true;
    }
  }

  setAssetPieChart() {
    let asCtx = this.as.nativeElement.getContext('2d');
    let lbls = ['Debt', 'Equity', 'Property', 'Others'];
    let debtTotal = 0, eqTotal = 0, propTotal = 0, othersTotal = 0, ta = 0;
    let list = [categories['Debt'], categories['Equity'], categories['Property'], categories['Others']];
    let bColors = this.utilService.theme == 'primary' ? ['#081B42', '#092152', '#0B2C6D', '#0D3789'] : ['#F0F0F0', '#DCDCDC', '#D0D0D0', '#BEBEBE'];
    this.sqlStorageService.allInvestments.map((inv) => {
      ta += inv.totalAmount;
      if(list[0].indexOf(inv.type) > -1) {
        debtTotal += inv.totalAmount;
      } else if(list[1].indexOf(inv.type) > -1) {
        eqTotal += inv.totalAmount;
      } else if(list[2].indexOf(inv.type) > -1) {
        propTotal += inv.totalAmount;
      } else {
        othersTotal += inv.totalAmount;
      }
    });

    let data = [(debtTotal * 100/ta).toFixed(2), (eqTotal * 100/ta).toFixed(2), (propTotal * 100/ta).toFixed(2), (othersTotal * 100/ta).toFixed(2)];
    try { this.asChart.destroy() } catch(e) { console.log(e); }
    this.asChart = new Chart(asCtx, {
        type: 'pie',
        data: {
          labels: lbls,
          datasets: [{
              data,
              borderWidth: 1,
              backgroundColor: bColors
          }]
        },
        options: {
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: function(tooltipItems, data) { 
                    return data.labels[tooltipItems.index] + ': ' + data.datasets[0].data[tooltipItems.index] + "%";
                }
            }
          }
        }
    });
  }

  calcInvestment() {
    let investments = this.sqlStorageService.allInvestments;
    //Get total amount
    //Get total loss
    //Get total profit
    let loss = 0, profit = 0, ta = 0;
    investments.map((inv) => {
      ta += +inv.totalAmount;
      profit += +inv.profit;
      loss += +inv.loss;
    });

    this.totalInvestedAmt = ta;
    if(profit > loss) {
      this.profit = profit - loss;
      this.profitPercent = Number((profit - loss)*100/ta).toFixed(2);
    } else if(profit < loss) {
      this.loss = loss - profit;
      this.lossPercent = Number((loss - profit)*100/ta).toFixed(2);
    }
  }
}
