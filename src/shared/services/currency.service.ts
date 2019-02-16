import { Injectable, EventEmitter } from '@angular/core';
import CurrencyToSymbolMap from 'currency-symbol-map/map';

@Injectable()
export class CurrencyService {
  changeCurrency = new EventEmitter<any>();
  currSymbolsMap = [];
  constructor() {
  	for(let key in CurrencyToSymbolMap) {
        this.currSymbolsMap.push({ name: key, symbol: CurrencyToSymbolMap[key] });
    }
  }
}