import { Component, ViewChild } from '@angular/core';
import { Slides, NavController } from 'ionic-angular';
import { UtilService } from '../../shared/services/util.service';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'welcome-slider',
  templateUrl: 'slides.html'
})
export class SliderPage {
  @ViewChild(Slides) slides: Slides;

  constructor(
    public utilService: UtilService,
    public navCtrl: NavController
  ) {}

  goToLastSlide() {
    while(!this.slides.isEnd()) {
      this.slides.slideNext();
    }
  }

  continue() {
    localStorage.isSkip = true;
    this.navCtrl.setRoot(TabsPage);
  }
}