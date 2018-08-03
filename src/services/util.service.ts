import { Injectable, EventEmitter } from "@angular/core";
import { months, types, uuid } from '../data/data';
import { LocalNotifications } from '@ionic-native/local-notifications';

@Injectable()
export class UtilService {
	public onChange: EventEmitter<any> = new EventEmitter<any>();
	public onNotif: EventEmitter<any> = new EventEmitter<any>();
	public onInvChange: EventEmitter<any> = new EventEmitter<any>();
	public theme: string = localStorage.theme || 'primary';
	public onThemeChange: EventEmitter<any> = new EventEmitter<any>();
	public showHelpToast: Boolean = false;
	public invTypes: any = {};
	
	constructor(
		private localNotif: LocalNotifications
	) {
		for(let i = 0; i < types.length; i++) { this.invTypes[types[i].type] = types[i].name }

		//Click handler for notification
		this.localNotif.on('click').subscribe((inv) => {
			this.onNotif.emit(inv);
		}, (err) => { 
			console.log(err); 
		})
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

	emitChangeEvent() {
		this.onChange.emit();
	}

	emitViewChange() {
		this.onInvChange.emit();
	}

	getDate(timestamp, useSlash?) {
		let _d = new Date(timestamp);
		return ('0' + _d.getDate()).slice(-2) + (useSlash ? "/" : "-") + months[_d.getMonth()] + (useSlash ? "/" : "-") + _d.getFullYear();
	}

	switchTheme() {
		localStorage.theme = this.theme == 'primary' ? 'dark' : 'primary';
		this.theme = localStorage.theme;
		this.onThemeChange.emit();
	}

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
}