import { Component } from '@angular/core';

import { AddNewPage } from '../addNew/addNew';
import { DashboardPage } from '../dashboard/dashboard';
import { ExistingPage } from '../existing/existing';
import { UtilService } from '../../services/util.service';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = DashboardPage;
  tab2Root = ExistingPage;
  tab3Root = AddNewPage;

  constructor(
  	public utilService: UtilService
  ) {

  }

  getTheme() {
  	return this.utilService.theme || 'primary';
  }
}
