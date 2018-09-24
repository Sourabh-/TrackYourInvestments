import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import Chart from 'chart.js';
import { UtilService } from '../../services/util.service';
import { types } from '../../data/data';
import { SQLStorageService } from '../../services/storage.service';

@Component({
  selector: 'drilldown-modal',
  templateUrl: 'drillDownModal.html'
})
export class DrillDownModal implements OnInit {

  @ViewChild('drillchart') drillchart: ElementRef;
  
  public typesObj: any = {};
  public typesWithNames: any = {};
  public drillChart: any;
  public selectedCurr: any;
  public type: '';
  public chartType: string = '';
  public chartTitle: string = '';
  private fn: string = '';

  constructor(
    public viewCtrl: ViewController,
    public utilService: UtilService,
    public sqlStorageService: SQLStorageService,
    public params: NavParams
  ) {}

  ngOnInit() {
    //MAKE KEY:VALUE FROM TYPES
    for(let i=0; i<types.length; i++) {
      this.typesObj[types[i].type] = types[i].name;
    }

    this.selectedCurr = this.params.get('selectedCurr');
    this.chartType = this.params.get('type');
    switch (this.chartType) {
      case 'growth':
        this.chartTitle = "Investment Growth";
        this.fn = 'setInvGrowthChart';
        break;
      
      case 'plstat':
        this.chartTitle = "Profit & Loss Statement";
        this.fn = 'setProfitLossChart';
        break;
    }

    this.getTypesWithNames();
  }

  getTypesWithNames() {
    let invs = this.sqlStorageService.allInvestments;
    if(invs.length) {
      this.type = invs[0].type;
      for(let i=0; i < invs.length; i++) {
        if(!this.typesWithNames[invs[i].type])
          this.typesWithNames[invs[i].type] = { 
            label: this.typesObj[invs[i].type],
            investments: []
          }

          this.typesWithNames[invs[i].type].investments.push(invs[i]);
      }

      this[this.fn](this.typesWithNames[this.type].investments);
    }
  }

  getKeys(obj) {
    return Object.keys(obj);
  }

  changeType(value) {
    this[this.fn](this.typesWithNames[value].investments);
  }

  setInvGrowthChart(investments) {
    let growthCtx = this.drillchart.nativeElement.getContext('2d');
    let lbls = [], dataTotalInAmount = [], dataNetAmount = [], dataProfitLoss = [], bColors = [];

    investments.map((inv, i) => {
      lbls.push(inv.name);
      dataTotalInAmount.push(inv.totalAmount);
      dataNetAmount.push(+inv.totalAmount + +inv.profit - +inv.loss);
      let plAmt = +inv.profit - +inv.loss;
      dataProfitLoss.push(Math.abs(plAmt));
      bColors.push(plAmt < 0 ? this.utilService.getLossColor() : (plAmt == 0) ? this.utilService.getZeroColor() : this.utilService.getProfitColor());
    });

    try { this.drillChart.destroy() } catch(e) { console.log(e); }
    this.drillChart = new Chart(growthCtx, {
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

  setProfitLossChart(investments) {
    let plCtx = this.drillchart.nativeElement.getContext('2d');
    let lbls = [], data = [], bColors = [];

    investments.map((inv) => {
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

    try { this.drillChart.destroy() } catch(e) { console.log(e); }
    this.drillChart = new Chart(plCtx, {
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

  dismiss() {
    this.viewCtrl.dismiss();
  }  

  getTheme() {
    return this.utilService.theme || 'primary';
  }
}