import { Injectable, EventEmitter } from "@angular/core";
import { 
	months, 
	types, 
	uuid, 
	quotes, 
	blues, 
	bluesRev, 
	blacks, 
	blacksRev 
} from '../data';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BasicService } from "./basic.service";

@Injectable()
export class UtilService {
	public onChange: EventEmitter<any> = new EventEmitter<any>();
	public onInvChange: EventEmitter<any> = new EventEmitter<any>();
	public theme: string = localStorage['theme'] || 'primary';
	public onThemeChange: EventEmitter<any> = new EventEmitter<any>();
	public showHelpToast: Boolean = false;
	public invTypes: any = {};
	
	constructor(
		private localNotif: LocalNotifications,
		private basic: BasicService
	) {
		for(let i = 0; i < types.length; i++) { this.invTypes[types[i].type] = types[i].name }
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

	switchTheme(theme) {
		localStorage['theme'] = theme || 'primary';
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
			let _quotes = this.basic.shuffleArray(quotes);
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

	updateInvestmentInMemory(invs, inv) {
		for(let i=0; i < invs.length; i++) {
			if(invs[i].name == inv.name) {
				invs[i] = { ...inv };
				break;
			}
		}
	}

	addToInvestmentsInMemory(invs, inv) {
		invs.push({ ...inv });
	}
}