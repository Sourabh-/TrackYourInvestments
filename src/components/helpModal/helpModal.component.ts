import { Component, OnInit } from '@angular/core';
import { ViewController, AlertController, ToastController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SQLStorageService } from '../../services/storage.service';

@Component({
  selector: 'help-modal',
  templateUrl: 'helpModal.html'
})
export class HelpModal implements OnInit {
  public links: any = [];

  constructor(
    public viewCtrl: ViewController,
    private iab: InAppBrowser,
    private sQLStorageService: SQLStorageService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController
  ) {

  }

  ngOnInit() {
  	this.getLinks();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getLinks() {
  	this.links = this.sQLStorageService.getLinks();
  }

  openLink(link) {
  	this.iab.create(link);
  }

  addNewLink() {
  	const linkPopup = this.alertCtrl.create({
      title: 'Add New Link',
      inputs: [
        {
          name: 'title',
          placeholder: 'Title'
        },
        {
          name: 'link',
          placeholder: 'Link'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            if(data.title && data.link) {
            	data.id = new Date().getTime();
            	this.sQLStorageService.addNewLink(data);
            	this.getLinks();
            	let toast = this.toastCtrl.create({
			      message: 'New link added',
			      duration: 3000,
			      position: 'bottom'
			    });	
			    toast.present();
            } else {
            	let toast = this.toastCtrl.create({
			      message: 'Incorrect data. Link not saved',
			      duration: 3000,
			      position: 'bottom'
			    });	
			    toast.present();
            }
          }
        }
      ]
    });
    linkPopup.present();
  }

  deleteLink(link) {
  	this.sQLStorageService.deleteLink(link.id);
  	this.getLinks();
  	let toast = this.toastCtrl.create({
      message: 'Link removed',
      duration: 3000,
      position: 'bottom'
    });	
    toast.present();	
  }
}