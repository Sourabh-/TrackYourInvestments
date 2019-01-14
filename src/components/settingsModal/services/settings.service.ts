import { Injectable, EventEmitter } from "@angular/core";
import { UtilService } from "../../../services/util.service";

@Injectable()
export class SettingsService {
    public isReloadReq: boolean = false;
    public settings: any = {};
    
	constructor(
        private utilService: UtilService
    ) {
        this.settings = this.getSettings();
    }
	
	getInitialSettings() {
		let settings = { 
			quotes: { 
				isQuoteShow: true, 
				isQuoteSet: false 
			}, showHide: this.getInitialShowHideSettings()
		};

		localStorage['settings'] = JSON.stringify(settings);
		return settings;
	}

	getInitialShowHideSettings() {
		return {
			isMyPortfolio: true,
			isPortDisByName: true,
			isPortDisByType: true,
			isNetWorthByName: true,
			isNetWorthByType: true,
			isInvVsNWByType: true,
			isInvGrowthByType: true,
			isprofitLossStatByType: true,
			isProfitDis: true,
			isProfitDisByType: true,
			isLossDis: true,
			isLossDisByType: true,
			isAssetAlloc: true
		};
	}

	getSettings() {
		let settings = localStorage['settings'] ? JSON.parse(localStorage['settings']) : this.getInitialSettings();
		//SET SHOWHIDE IF NOT THERE
    	if(!settings.showHide) settings.showHide = this.getInitialShowHideSettings();
    	return settings;
	}

	settingsUpdated() {
		this.settings = this.getSettings();
    }
    
    set(ev, type, name?) {
        switch (type) {
          case "isQuoteShow":
            this.settings.quotes.isQuoteShow = ev.checked;
            localStorage['settings'] = JSON.stringify(this.settings);
            this.utilService.resetQuotesNotification(ev.checked);
            break;
          case "showHide":
                this.settings.showHide[name] = ev.checked;
                localStorage['settings'] = JSON.stringify(this.settings);
                this.isReloadReq = true;
            break;
        }
      }
}