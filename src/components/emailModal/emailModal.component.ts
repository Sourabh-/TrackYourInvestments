import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { EmailComposer } from '@ionic-native/email-composer';

@Component({
  selector: 'email-modal',
  templateUrl: 'emailModal.html'
})
export class EmailModal {
  public email: string = '';

  constructor(
    public viewCtrl: ViewController,
    private emailComposer: EmailComposer
  ) {

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  handleEmailSend() {
    this.dismiss();
    this.emailComposer.isAvailable()
      .then((available: boolean) =>
      {

         // Check that plugin has been granted access permissions to
         // user's e-mail account
         this.emailComposer.hasPermission()
         .then((isPermitted : boolean) =>
         {

            // Define an object containing the
            // keys/values for populating the device
            // default mail fields when a new message
            // is created
            let email : any = {
               app: 'mailto',
               to: 'trackurinvestments@gmail.com',
               subject: "Suggestions",
               body: this.email,
               isHtml: true
            };

            // Open the device e-mail client and create
            // a new e-mail message populated with the
            // object containing our message data
            this.emailComposer.open(email);
         })
         .catch((error : any) => {
            console.log('No access permission granted');
            console.dir(error);
         });
      })
      .catch((error : any) => {
         console.log('User does not appear to have device e-mail account');
         console.dir(error);
      });
  }  
}