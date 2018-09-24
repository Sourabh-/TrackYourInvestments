import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import Chart from 'chart.js';
import { PopoverController, ToastController } from 'ionic-angular';
import { PopoverPage } from '../../components/popover/popover.component';
import { CalcModal } from '../../components/calcModal/calcModal.component';
import { DrillDownModal } from '../../components/drillDownModal/drillDownModal.component';
import { UtilService } from '../../services/util.service';
import { SQLStorageService } from '../../services/storage.service';
import { CurrencyService } from '../../services/currency.service';
import { categories, types } from '../../data/data';

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage implements OnInit {
  @ViewChild('bar') bar: ElementRef;
  @ViewChild('pie') pie: ElementRef;
  @ViewChild('port') port: ElementRef;
  @ViewChild('net') net: ElementRef;
  @ViewChild('nett') nett: ElementRef;
  @ViewChild('profitLossType') pltype: ElementRef;
  @ViewChild('profitonly') po: ElementRef;
  @ViewChild('profitonlybytype') potype: ElementRef;
  @ViewChild('lossonly') lo: ElementRef;
  @ViewChild('lossonlybytype') lotype: ElementRef;
  @ViewChild('asset') as: ElementRef;
  @ViewChild('netwvs') netwvs: ElementRef;
  @ViewChild('invgrw') invgrw: ElementRef;

  public barChart: any;
  public pieChart: any;
  public pltChart: any;
  public poChart: any;
  public potypeChart: any;
  public loChart: any;
  public lotypeChart: any;
  public asChart: any;
  public potChart: any;
  public nwChart: any;
  public nwtChart: any;
  public netwvsChart: any;
  public invGrowthChart: any;
  public isLoading: boolean = true;
  public noData: boolean = false;
  public totalInvestedAmt = 0;
  public netWorth = 0;
  public profit = 0;
  public profitPercent:any = 0;
  public loss = 0;
  public lossPercent:any = 0;
  private callCount = 0;
  public selectedCurr = localStorage['currency'] ? JSON.parse(localStorage['currency']) : { name: 'USD', symbol: '$' };
  public showLossMsg: boolean = false;
  public showProfitMsg: boolean = false;
  public showLossMsgByType: boolean = false;
  public showProfitMsgByType: boolean = false;
  public typesObj = {};
  public settings: any = this.utilService.getSettings();

  constructor(
    public navCtrl: NavController, 
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    private utilService: UtilService,
    public sqlStorageService: SQLStorageService,
    public toastCtrl: ToastController,
    public currencyService: CurrencyService
  ) {
    //MAKE KEY:VALUE FROM TYPES
    for(let i=0; i<types.length; i++) {
      this.typesObj[types[i].type] = types[i].name;
    }
  }

  setCharts() {
    this.settings = this.utilService.getSettings();
    this.calcInvestment();

    if(this.settings.showHide['isMyPortfolio']) this.setBarChart();
    if(this.settings.showHide['isPortDisByName']) this.setPieChart();
    if(this.settings.showHide['isPortDisByType']) this.setPortfolioByTypeChart();
    if(this.settings.showHide['isNetWorthByName']) this.setNetWorthChart();
    if(this.settings.showHide['isNetWorthByType']) this.setNetWorthByTypeChart();
    if(this.settings.showHide['isInvVsNWByType']) this.setNetWorthVsInvestedAmtChart();
    if(this.settings.showHide['isInvGrowthByType']) this.setInvGrowthChart();
    if(this.settings.showHide['isprofitLossStatByType']) this.setProfitLossByTypeChart();
    if(this.settings.showHide['isProfitDis']) this.setProfitPieChart();
    if(this.settings.showHide['isProfitDisByType']) this.setProfitByTypePieChart();
    if(this.settings.showHide['isLossDis']) this.setLossPieChart();
    if(this.settings.showHide['isLossDisByType']) this.setLossByTypePieChart();
    if(this.settings.showHide['isAssetAlloc']) this.setAssetPieChart();
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
        this.setCharts();
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
      this.netWorth = 0;
      this.profit = 0;
      this.profitPercent = 0;
      this.loss = 0;
      this.lossPercent = 0;
      this.setCharts();
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

  openDrillDownModal(type) {
    let drillDownMdl = this.modalCtrl.create(DrillDownModal, {
      selectedCurr: this.selectedCurr,
      type
    });
    
    drillDownMdl.present();
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
                label: (tooltipItems, data) => { 
                    return data.labels[tooltipItems.index] + ': ' + data.datasets[0].data[tooltipItems.index] + "%";
                }
            }
          }
        }
    });
  }

  setPortfolioByTypeChart() {
    let portCtx = this.port.nativeElement.getContext('2d');
    let lbls = [], tempData = {}, data = [], percent = [], bColors = [], ta = 0;

    this.sqlStorageService.allInvestments.map((inv, i) => {
      if(!tempData[inv.type]) {
        tempData[inv.type] = {
          amount: inv.totalAmount,
          label: this.typesObj[inv.type]
        }
      } else {
        tempData[inv.type].amount += inv.totalAmount;
      }

      ta += inv.totalAmount;
    });

    let cnt = 0;
    for(let key in tempData) {
      lbls.push(tempData[key].label);
      bColors.push(this.utilService.getThemeBasedColor(cnt));
      data.push(tempData[key].amount);
      percent.push(((tempData[key].amount * 100)/ta).toFixed(2));
      cnt++;
    }

    try { this.potChart.destroy() } catch(e) { console.log(e); }
    this.potChart = new Chart(portCtx, {
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
                label: (tooltipItems, data) => { 
                    return data.labels[tooltipItems.index] + ': ' + this.selectedCurr.symbol + data.datasets[0].data[tooltipItems.index] + ", " + percent[tooltipItems.index] + "%";
                }
            }
          }
        }
    });
  }

  setNetWorthChart() {
    let nwCtx = this.net.nativeElement.getContext('2d');
    let lbls = [], data = [], bColors = [];

    this.sqlStorageService.allInvestments.map((inv, i) => {
      lbls.push(inv.name);
      data.push(+inv.totalAmount + +inv.profit - +inv.loss);
      bColors.push(this.utilService.getThemeBasedColor(i));
    });

    try { this.nwChart.destroy() } catch(e) { console.log(e); }
    this.nwChart = new Chart(nwCtx, {
        type: 'bar',
        data: {
          labels: lbls,
          datasets: [{
              label: 'Net Worth',
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
                      return 'Net Worth: ' + this.selectedCurr.symbol + Math.abs(Number(data.datasets[0].data[tooltipItems.index]));
                  }
              }
            }
        }
    });
  }

  setNetWorthByTypeChart() {
    let nwtCtx = this.nett.nativeElement.getContext('2d');
    let lbls = [], tempData = {}, data = [], bColors = [];

    this.sqlStorageService.allInvestments.map((inv, i) => {
      if(!tempData[inv.type]) {
        tempData[inv.type] = {
          amount: (+inv.totalAmount + +inv.profit - +inv.loss),
          label: this.typesObj[inv.type]
        }
      } else {
        tempData[inv.type].amount += (+inv.totalAmount + +inv.profit - +inv.loss);
      }
    });

    let cnt = 0;
    for(let key in tempData) {
      lbls.push(tempData[key].label);
      bColors.push(this.utilService.getThemeBasedColor(cnt));
      data.push(tempData[key].amount);
      cnt++;
    }

    try { this.nwtChart.destroy() } catch(e) { console.log(e); }
    this.nwtChart = new Chart(nwtCtx, {
        type: 'bar',
        data: {
          labels: lbls,
          datasets: [{
              label: 'Net Worth',
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
                      return 'Net Worth: ' + this.selectedCurr.symbol + Math.abs(Number(data.datasets[0].data[tooltipItems.index]));
                  }
              }
            }
        }
    });
  }

  setNetWorthVsInvestedAmtChart() {
    let netwvsCtx = this.netwvs.nativeElement.getContext('2d');
    let lbls = [], tempData = {}, dataTotalInAmount = [], dataNetAmount = [];

    this.sqlStorageService.allInvestments.map((inv, i) => {
      if(!tempData[inv.type]) {
        tempData[inv.type] = {
          investedAmount: inv.totalAmount,
          netAmount: (+inv.totalAmount + +inv.profit - +inv.loss),
          label: this.typesObj[inv.type]
        }
      } else {
        tempData[inv.type].investedAmount += inv.totalAmount;
        tempData[inv.type].netAmount += (+inv.totalAmount + +inv.profit - +inv.loss);
      }
    });

    for(let key in tempData) {
      lbls.push(tempData[key].label);
      dataTotalInAmount.push(tempData[key].investedAmount);
      dataNetAmount.push(tempData[key].netAmount);
    }

    try { this.netwvsChart.destroy() } catch(e) { console.log(e); }
    this.netwvsChart = new Chart(netwvsCtx, {
        type: 'bar',
        data: {
          labels: lbls,
          datasets: [{
            label: 'Invested Amount',
            data: dataTotalInAmount,
            backgroundColor: (this.utilService.theme == 'primary') ? '#9ABEFF' : '#DCDCDC'
          }, {
            label: 'Current Worth',
            data: dataNetAmount,
            backgroundColor: (this.utilService.theme == 'primary') ? '#081B42' : '#000000'
          }]
        },
        options: {
            responsive: true,
            legend: {
                onClick: (e) => e.stopPropagation()
            },
            scales: {
                xAxes: [{
                    categoryPercentage: 0.9,
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
              mode: 'index',
              callbacks: {
                  label: (tooltipItems, data) => { 
                      return (tooltipItems.datasetIndex == 0) ?
                       'Invested Amount: ' + this.selectedCurr.symbol + Math.abs(Number(data.datasets[0].data[tooltipItems.index])) : 
                       'Current Worth: ' + this.selectedCurr.symbol + Math.abs(Number(data.datasets[1].data[tooltipItems.index]));
                  }
              }
            }
        }
    });
  }

  setInvGrowthChart() {
    let invGrowthCtx = this.invgrw.nativeElement.getContext('2d');
    let lbls = [], tempData = {}, dataTotalInAmount = [], dataNetAmount = [], dataProfitLoss = [], bColors = [];

    this.sqlStorageService.allInvestments.map((inv, i) => {
      if(!tempData[inv.type]) {
        tempData[inv.type] = {
          investedAmount: inv.totalAmount,
          netAmount: (+inv.totalAmount + +inv.profit - +inv.loss),
          profitLossAmt: (+inv.profit - +inv.loss),
          label: this.typesObj[inv.type]
        }
      } else {
        tempData[inv.type].investedAmount += inv.totalAmount;
        tempData[inv.type].profitLossAmt += (+inv.profit - +inv.loss);
        tempData[inv.type].netAmount += (+inv.totalAmount + +inv.profit - +inv.loss);
      }
    });

    for(let key in tempData) {
      lbls.push(tempData[key].label);
      dataTotalInAmount.push(tempData[key].investedAmount);
      dataNetAmount.push(tempData[key].netAmount);
      dataProfitLoss.push(Math.abs(tempData[key].profitLossAmt));
      bColors.push(tempData[key].profitLossAmt < 0 ? this.utilService.getLossColor() : (tempData[key].profitLossAmt == 0) ? this.utilService.getZeroColor() : this.utilService.getProfitColor());
    }

    try { this.invGrowthChart.destroy() } catch(e) { console.log(e); }
    this.invGrowthChart = new Chart(invGrowthCtx, {
        type: 'bar',
        data: {
          labels: lbls,
          datasets: [{
            label: 'Net Worth',
            data: dataNetAmount,
            backgroundColor: '#FFBF17',
            type: 'line',
            fill: false,
            borderColor: '#FFBF17'
          }, {
            label: 'Invested Amount',
            data: dataTotalInAmount,
            backgroundColor: (this.utilService.theme == 'primary') ? '#9ABEFF' : '#DCDCDC'
          }, {
            label: 'Growth',
            data: dataProfitLoss,
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
                    categoryPercentage: 0.9,
                    barPercentage: 1.0,
                    ticks: {
                      autoSkip: false
                    },
                    stacked: true
                }],
                yAxes: [{
                    ticks: {
                      beginAtZero: true
                    },
                    stacked: true
                }]
            },
            tooltips: {
              enabled: true,
              mode: 'index',
              callbacks: {
                label: (tooltipItems, data) => {
                   if(tooltipItems.datasetIndex == 1) {
                     return 'Invested Amount: ' + this.selectedCurr.symbol + Math.abs(Number(data.datasets[1].data[tooltipItems.index]));
                   } else if(tooltipItems.datasetIndex == 0) {
                     return 'Current Worth: ' + this.selectedCurr.symbol + Math.abs(Number(data.datasets[0].data[tooltipItems.index]));
                   } else {
                     return (bColors[tooltipItems.index] == this.utilService.getLossColor() ? 'Loss: ' : 'Growth: ') + this.selectedCurr.symbol + Math.abs(Number(data.datasets[2].data[tooltipItems.index]));
                   }
                }
              }
            }
        }
    });
  }

  setProfitLossByTypeChart() {
    let pltypeCtx = this.pltype.nativeElement.getContext('2d');
    let lbls = [], tempData = {}, data = [], bColors = [];

    this.sqlStorageService.allInvestments.map((inv) => {
      if(!tempData[inv.type]) {
        tempData[inv.type] = {
          label: this.typesObj[inv.type],
          profitLoss: (+inv.profit - +inv.loss)
        }
      } else {
        tempData[inv.type].profitLoss += (+inv.profit - +inv.loss);
      }
    });

    for(let key in tempData) {
      lbls.push(tempData[key].label);
      data.push(tempData[key].profitLoss);
      bColors.push(tempData[key].profitLoss < 0 ? this.utilService.getLossColor() : tempData[key].profitLoss > 0 ? this.utilService.getProfitColor() : this.utilService.getZeroColor());
    }

    try { this.pltChart.destroy() } catch(e) { console.log(e); }
    this.pltChart = new Chart(pltypeCtx, {
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
    let lbls = [], data = [], bColors = [];
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
                label: (tooltipItems, data) => { 
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

  setProfitByTypePieChart() {
    let poTypeCtx = this.potype.nativeElement.getContext('2d');
    let lbls = [], data = [], bColors = [], tempData = {};
    let totalProfit = 0;
    let cnt = 0;
    this.sqlStorageService.allInvestments.map((inv) => {
      if(inv.profit <= inv.loss) return;
      totalProfit += inv.profit - inv.loss;
      if(!tempData[inv.type]) {
        tempData[inv.type] = {
          label: this.typesObj[inv.type],
          profit: inv.profit - inv.loss
        }
      } else {
        tempData[inv.type].profit += inv.profit - inv.loss;
      }
    });

    for(let key in tempData) {
      lbls.push(tempData[key].label);
      data[cnt] = ((tempData[key].profit * 100) / totalProfit).toFixed(2);
      bColors.push(this.utilService.getThemeBasedColor(cnt));
      cnt++;
    }

    try { this.potypeChart.destroy() } catch(e) { console.log(e); }

    if(data.length) {
      this.showProfitMsgByType = false;
      this.potypeChart = new Chart(poTypeCtx, {
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
                label: (tooltipItems, data) => { 
                    return data.labels[tooltipItems.index] + ': ' + data.datasets[0].data[tooltipItems.index] + "%";
                }
            }
          }
        }
    });
    } else {
      this.showProfitMsgByType = true;
    }
  }

  setLossPieChart() {
    let loCtx = this.lo.nativeElement.getContext('2d');
    let lbls = [], data = [], bColors = [];
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
                label: (tooltipItems, data) => { 
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

  setLossByTypePieChart() {
    let loTypeCtx = this.lotype.nativeElement.getContext('2d');
    let lbls = [], data = [], bColors = [], tempData = {};
    let totalProfit = 0;
    let cnt = 0;
    this.sqlStorageService.allInvestments.map((inv) => {
      if(inv.loss <= inv.profit) return;
      totalProfit += inv.loss - inv.profit;
      if(!tempData[inv.type]) {
        tempData[inv.type] = {
          label: this.typesObj[inv.type],
          loss: inv.loss - inv.profit
        }
      } else {
        tempData[inv.type].loss += inv.loss - inv.profit;
      }
    });

    for(let key in tempData) {
      lbls.push(tempData[key].label);
      data[cnt] = ((tempData[key].loss * 100) / totalProfit).toFixed(2);
      bColors.push(this.utilService.getThemeBasedColor(cnt));
      cnt++;
    }

    try { this.lotypeChart.destroy() } catch(e) { console.log(e); }

    if(data.length) {
      this.showLossMsgByType = false;
      this.lotypeChart = new Chart(loTypeCtx, {
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
                label: (tooltipItems, data) => { 
                    return data.labels[tooltipItems.index] + ': ' + data.datasets[0].data[tooltipItems.index] + "%";
                }
            }
          }
        }
    });
    } else {
      this.showLossMsgByType = true;
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
                label: (tooltipItems, data) => { 
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
    let loss = 0, profit = 0, ta = 0, nw = 0;
    investments.map((inv) => {
      ta += +inv.totalAmount;
      profit += +inv.profit;
      loss += +inv.loss;
      nw += +inv.totalAmount + +inv.profit - +inv.loss;
    });

    this.totalInvestedAmt = ta;
    this.netWorth = nw;
    if(profit > loss) {
      this.profit = profit - loss;
      this.profitPercent = Number((profit - loss)*100/ta).toFixed(2);
    } else if(profit < loss) {
      this.loss = loss - profit;
      this.lossPercent = Number((loss - profit)*100/ta).toFixed(2);
    }
  }
}
