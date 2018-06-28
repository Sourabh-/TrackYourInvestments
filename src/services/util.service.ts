import { Injectable, EventEmitter } from "@angular/core";
import { months, types } from '../data/data';

@Injectable()
export class UtilService {
	public onChange: EventEmitter<any> = new EventEmitter<any>();
	public theme: string = localStorage.theme || 'primary';
	public onThemeChange: EventEmitter<any> = new EventEmitter<any>();
	public showHelpToast: Boolean = false;
	public invTypes: any = {};
	
	constructor() {
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

	emitChangeEvent() {
		this.onChange.emit();
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
}