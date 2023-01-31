import { Component, OnInit, ElementRef } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { HttpService } from 'src/app/base-services/comms/http/http.service';
import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';

@Component({
  selector: 'app-mails-sever',
  templateUrl: './mails-sever.component.html',
  styleUrls: ['./mails-sever.component.scss'],
})
export class MailsSeverComponent implements OnInit {

  constructor(
    private modalCtrl: ModalController,
    private loadingController: LoadingController,
    private alertCtrl: AlertController,
    private appHttp: HttpService,
    public appOrg: OrganizationService,
    private eleRef: ElementRef,
    private mails: MailsService
    ) { }

  ngOnInit() {}

  cancel(){

    return this.modalCtrl.dismiss(null, 'cancel');

  }

  createServer(){

    const serverName: string = this.eleRef.nativeElement.querySelector('.serverNameIpt').value;
    const serverAddress: string = this.eleRef.nativeElement.querySelector('.serverAddressIpt').value;
    const serverDomain: string = this.appOrg.getOrganization().orgDomain

    if (serverAddress === '' && serverName === ''){

      this.showAlert('Server Creation','Please fill all required fields.')

    }else{

      const createServerForm: FormData = new FormData();

      createServerForm.append('domain',serverDomain)
      createServerForm.append('name',serverName)
      createServerForm.append('address',serverAddress)

      this.showLoader('Creating mail server').then((loaderEle: HTMLIonLoadingElement) =>{

        this.appHttp.postHttp(createServerForm,'/mails/createServer').then((resp: any) =>{

          loaderEle.dismiss();

          if (resp.status === 0){

            this.showAlert('Server Creation','Could not create the server.')

          }else if (resp.status === 1){

            this.showAlert('Server Creation','Server successfully created.')

            const mailServer: MailServer = {
              name: serverName,
              address: serverAddress,
              domain: serverDomain
            }

            this.mails.setMainMailServer(mailServer)

            this.mails.mailServers.push(mailServer);

          }

        }).catch((err: any) =>{

          loaderEle.dismiss();
          this.showAlert('Server Creation','Could not create the server, please try again.')
          console.error(err);

        })

      })

    }


  }


  showLoader(message:string): Promise<HTMLIonLoadingElement>{

    return new Promise<HTMLIonLoadingElement>((resolve) => {

      this.loadingController.create({
        message:message
      }).then((respLoader: HTMLIonLoadingElement) =>{

        respLoader.present()
        resolve(respLoader)

      })

    })

  }

  showAlert(alertTitle:string, alertMsg: string): Promise<HTMLIonAlertElement>{

    return new Promise<HTMLIonAlertElement>((resolve, reject) => {

      this.alertCtrl.create({
        header:alertTitle,
        message: alertMsg,
        buttons:[

          {
            text:'Ok',
            role:'Cancel'
          }

        ]
      }).then((alertEle: HTMLIonAlertElement) =>{

        alertEle.present()

        resolve(alertEle)

      })

    })

  }

}
