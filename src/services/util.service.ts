import { Injectable, EventEmitter } from "@angular/core";
import { months } from '../data/data';

@Injectable()
export class UtilService {
	public onChange: EventEmitter<any> = new EventEmitter<any>();
	public theme: string = localStorage.theme || 'primary';
	public onThemeChange: EventEmitter<any> = new EventEmitter<any>();
	public showHelpToast: Boolean = false;
	
	constructor() {}

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

	getZeroColor() {
		return "#488aff";
	}

	emitChangeEvent() {
		this.onChange.emit();
	}

	getDate(timestamp) {
		let _d = new Date(timestamp);
		return ('0' + _d.getDate()).slice(-2) + "-" + months[_d.getMonth()] + "-" + _d.getFullYear();
	}

	switchTheme() {
		localStorage.theme = this.theme == 'primary' ? 'dark' : 'primary';
		this.theme = localStorage.theme;
		this.onThemeChange.emit();
	}
}