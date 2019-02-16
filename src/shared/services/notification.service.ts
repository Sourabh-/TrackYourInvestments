import { Injectable } from "@angular/core";
import { 
	uuid, 
	quotes
} from '../data';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BasicService } from "./basic.service";

@Injectable()
export class NotificationService {
    constructor(
        private localNotif: LocalNotifications,
        private basic: BasicService
    ) {}

	schedule(id, text, title, time, data = {}) {
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
	}
    //This is only for investment
	setNotification(name, title, text, time, data) {
		let id: any = '';
		for(let i=0; i < name.length; i++) {
			id += uuid[name[i].toLowerCase()];
		}

		//Clear notification if reminder was already set
		this.localNotif.clear(id).then(() => {
			this.schedule(id, text, title, time, data);
		}).catch((err) => { 
			console.log(err); 
			this.schedule(id, text, title, time, data);
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
			this.schedule(id, text, title, time, data);
		}).catch((err) => { 
			console.log(err); 
			this.schedule(id, text, title, time, data);
		});
	}

	clearNotificationForAll(id) {
		this.localNotif.clear(id).then(() => {}).catch((err) => { console.log(err); });
	}
}