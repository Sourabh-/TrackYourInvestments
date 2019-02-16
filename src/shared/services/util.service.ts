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
		for (let i = 0; i < types.length; i++) { this.invTypes[types[i].type] = types[i].name }
	}

	getRandomColor() {
		let letters = '0123456789ABCDEF';
		let color = '#';
		for (let i = 0; i < 6; i++) {
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
		for (let i = 0; i < 5; i++) {
			if (i == 2) {
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
		for (let i = 0; i < 5; i++) {
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
		if (i < 13) {
			return blacks[i];
		} else {
			return Math.floor(i / 13) % 2 == 0 ? blacks[(i % 13)] : blacksRev[(i % 13)];
		}
	}

	getBlueColor(i) {
		if (i < 12) {
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

	getDateTime(timestamp, useSlash?) {
		let _d = new Date(timestamp);
		let hours = _d.getHours();
		let last = hours > 12 ? 'PM' : 'AM';
		if (hours > 12) {
			hours -= 12;
		} else if (hours === 0) {
			hours = 12;
		}
		return ('0' + _d.getDate()).slice(-2) + (useSlash ? "/" : "-") + months[_d.getMonth()] + (useSlash ? "/" : "-") + _d.getFullYear() + " " + ('0' + hours).slice(-2) + ":" + ('0' + _d.getMinutes()).slice(-2) + " " + last;
	}

	switchTheme(theme) {
		localStorage['theme'] = theme || 'primary';
		this.theme = localStorage['theme'];
		this.onThemeChange.emit();
	}

	updateInvestmentInMemory(invs, inv) {
		for (let i = 0; i < invs.length; i++) {
			if (invs[i].name == inv.name) {
				invs[i] = { ...inv };
				invs[i].totalAmount = Number(invs[i].totalAmount);
				invs[i].profit = Number(invs[i].profit);
				invs[i].loss = Number(invs[i].loss);
				break;
			}
		}
	}

	addToInvestmentsInMemory(invs, inv) {
		inv.totalAmount = Number(inv.totalAmount);
		inv.profit = Number(inv.profit);
		inv.loss = Number(inv.loss);
		invs.push({ ...inv });
	}
}