import { Injectable, EventEmitter } from "@angular/core";
import { months, types, uuid, quotes } from '../data/data';
import { LocalNotifications } from '@ionic-native/local-notifications';

const blues = [
		'#9ABEFF', '#74A5FD', '#4082FE', '#2470FE', '#0C5FFF', '#0C58EA', '#0A49C1', '#0C41A6', '#0D3789', '#0B2C6D',
		'#092152', '#081B42'
];
const bluesRev = [
		"#081B42", "#092152", "#0B2C6D", "#0D3789", "#0C41A6", "#0A49C1", "#0C58EA", "#0C5FFF", "#2470FE", "#4082FE", 
		"#74A5FD", "#9ABEFF"
];
const blacks = [
		'#000000', '#202020', '#303030', '#404040', '#585858', '#696969', '#808080', '#989898', '#A9A9A9', '#BEBEBE',
		'#D0D0D0', '#DCDCDC', '#F0F0F0'
];
const blacksRev =  [
		"#F0F0F0", "#DCDCDC", "#D0D0D0", "#BEBEBE", "#A9A9A9", "#989898", "#808080", "#696969", "#585858", "#404040", 
		"#303030", "#202020", "#000000"
];

@Injectable()
export class UtilService {
	public onChange: EventEmitter<any> = new EventEmitter<any>();
	public onInvChange: EventEmitter<any> = new EventEmitter<any>();
	public theme: string = localStorage['theme'] || 'primary';
	public onThemeChange: EventEmitter<any> = new EventEmitter<any>();
	public showHelpToast: Boolean = false;
	public invTypes: any = {};
	public onSettingsChange: EventEmitter<any> = new EventEmitter<any>();
	
	constructor(
		private localNotif: LocalNotifications
	) {
		for(let i = 0; i < types.length; i++) { this.invTypes[types[i].type] = types[i].name }
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

	getRandomColor() {
		let letters = '0123456789ABCDEF';
	    let color = '#';
	    for (let i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    
	    return color;
	}

	getLossColor() {
		return "#FF0000";
	}

	getProfitColor() {
		return "#589a6c";
	}

	getProfitRandomColor() {
		let center = 'A1';
		let letters = '0123456789ABCDEF';
		let color = '#';
	    for (let i = 0; i < 5; i++ ) {
	    	if(i == 2) {
	    		color += center;
	    	}
	    	else
	        	color += letters[Math.floor(Math.random() * 16)];
	    }
	    
	    return color;	
	}

	getLossRandomColor() {
		let letters = '0123456789ABCDEF';
		let color = '#CF';
	    for (let i = 0; i < 5; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    
	    return color;	
	}

	getZeroColor() {
		return "#488aff";
	}

	getThemeBasedColor(i) {
		return (this.theme == 'primary') ? this.getBlueColor(i) : this.getBlackColor(i);
	}

	getBlackColor(i) {
		if(i < 13) {
			return blacks[i];
		} else {
			return Math.floor(i / 13) % 2 == 0 ? blacks[(i % 13)] : blacksRev[(i % 13)];
		}
	}

	getBlueColor(i) {
		if(i < 12) {
			return blues[i];
		} else {
			return Math.floor(i / 12) % 2 == 0 ? blues[(i % 12)] : bluesRev[(i % 12)];
		}
	}

	emitChangeEvent() {
		this.onChange.emit();
	}

	emitViewChange() {
		this.onInvChange.emit();
	}

	getDate(timestamp, useSlash?, onlyMY?) {
		let _d = new Date(timestamp);
		return onlyMY ? (months[_d.getMonth()] + (useSlash ? "/" : "-") + _d.getFullYear()) : (('0' + _d.getDate()).slice(-2) + (useSlash ? "/" : "-") + months[_d.getMonth()] + (useSlash ? "/" : "-") + _d.getFullYear());
	}

	switchTheme() {
		localStorage['theme'] = this.theme == 'primary' ? 'dark' : 'primary';
		this.theme = localStorage['theme'];
		this.onThemeChange.emit();
	}

	//This is only for investment
	setNotification(name, title, text, time, data) {
		let id: any = '';
		for(let i=0; i < name.length; i++) {
			id += uuid[name[i].toLowerCase()];
		}

		//Clear notification if reminder was already set
		this.localNotif.clear(id).then(() => {
			this.localNotif.schedule({
		        id: Number(id),
		        text,
		        title,
		        vibrate: true,
		        led: true,
		        trigger: { at: new Date(time) },
		        lockscreen: true,
		        data
		    });
		}).catch((err) => { 
			console.log(err); 
			this.localNotif.schedule({
		        id: Number(id),
		        text,
		        title,
		        vibrate: true,
		        led: true,
		        trigger: { at: new Date(time) },
		        lockscreen: true,
		        data
		    });
		});
	}

	clearNotification(name) {
		let id: any = '';
		for(let i=0; i < name.length; i++) {
			id += uuid[name[i].toLowerCase()];
		}

		this.localNotif.clear(id).then(() => {}).catch((err) => { console.log(err); });
	}

	resetQuotesNotification(isQuoteShow) {
		//A FIX IS DONE IN "\platforms\android\app\src\main\java\de\appplant\cordova\plugin\notification\receiver\AbstractRestoreReceiver"
		//AS NOTIFICATIONS WERE CRASHING THE APP IN ANDROID OREO (8.0/8.1)
		//THIS IS THE FIX - 
		//import android.os.UserManager;
		//...
		//String action = intent.getAction(); - AFTER THIS ADD ->
		//...
        //if (SDK_INT >= 24) {
        //  UserManager um = (UserManager) context.getSystemService(UserManager.class);
        //  if (um == null || um.isUserUnlocked() == false) return;
        //}

		if(isQuoteShow) {
			let _quotes = this.shuffleArray(quotes);
	        let time = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + (1000 * 60 * 60 * 10);
	        for(let i=0; i < _quotes.length; i++) {
	           time += 1000 * 60 * 60 * 24;
	           this.setNotificationForAll(_quotes[i].id, "Quote of the day", _quotes[i].quote, time, { isQuote: true });
	        }
		} else {
			for(let i=0; i<quotes.length; i++) { this.clearNotificationForAll(quotes[i].id); }
		}
	}

	setNotificationForAll(id, title, text, time, data = {}) {
		this.localNotif.clear(id).then(() => {
			this.localNotif.schedule({
		        id: Number(id),
		        text,
		        title,
		        vibrate: true,
		        led: true,
		        trigger: { at: new Date(time) },
		        lockscreen: true,
		        data
		    });
		}).catch((err) => { 
			console.log(err); 
			this.localNotif.schedule({
		        id: Number(id),
		        text,
		        title,
		        vibrate: true,
		        led: true,
		        trigger: { at: new Date(time) },
		        lockscreen: true,
		        data
		    });
		});
	}

	clearNotificationForAll(id) {
		this.localNotif.clear(id).then(() => {}).catch((err) => { console.log(err); });
	}

	shuffleArray(array) {
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	}

	settingsUpdated() {
		this.onSettingsChange.emit();
	}
}