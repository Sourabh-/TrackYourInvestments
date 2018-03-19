import { Component, Input } from '@angular/core';
import { types } from '../../data/data';

@Component({
  selector: 'investment-form',
  templateUrl: 'investmentForm.html'
})
export class FormComponent {

	@Input() handleFormSubmit: Function;
	@Input() investment: any;
	@Input() isError: boolean;
	@Input() errorMsg: string;
	@Input() maxDate: string;
	@Input() isEdit: boolean;
	@Input() isDisabled: boolean;
	@Input() submitButtonText: string;
	public types = types;

	constructor() {

	}
}