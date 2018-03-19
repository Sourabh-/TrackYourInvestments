import { Component } from '@angular/core';

import { AddNewPage } from '../addNew/addNew';
import { DashboardPage } from '../dashboard/dashboard';
import { ExistingPage } from '../existing/existing';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = DashboardPage;
  tab2Root = ExistingPage;
  tab3Root = AddNewPage;

  constructor() {

  }
}
