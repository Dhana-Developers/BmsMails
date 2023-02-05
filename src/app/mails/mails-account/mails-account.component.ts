import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { ModalController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { UserService } from 'src/app/base-services/user/user.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';

import { HttpService } from 'src/app/base-services/comms/http/http.service';

@Component({
  selector: 'app-mails-account',
  templateUrl: './mails-account.component.html',
  styleUrls: ['./mails-account.component.scss'],
})
export class MailsAccountComponent implements OnInit {

  constructor(
    public appOrg: OrganizationService,
    public appDep: DepartmentsService,
    public appMemb: MembersService,
    public appUser: UserService,
    public appRouter: Router,
    public appMails: MailsService,
    private appHttp: HttpService,
    private modalCtrl: ModalController,
    private eleRef: ElementRef,
    private loadingController: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {

    if (this.appUser.getMainUser().username == ''){

      this.appRouter.navigateByUrl('auth/signIn')

    }

  }

  cancel(){

    return this.modalCtrl.dismiss(null, 'cancel');

  }


  getMailHeads(flagId: number):void{

    const fetchMailHeadsForm: FormData = new FormData()
    fetchMailHeadsForm.append('flagId',JSON.stringify(flagId))
    fetchMailHeadsForm.append('objectMailAccount',this.appMails.mailAccount.hostLoginAddress)

    this.appHttp.postHttp(fetchMailHeadsForm,'/mails/getMailHeads').then((resp: Array<any>) =>{

      this.appMails.mailHeads=[]

      resp.forEach((mailHeadResp: any) =>{

        const fetchedMailHead:MailHead={
          mailObjectId: mailHeadResp.mailObjectId,
          mailSubject: mailHeadResp.mailSubject,
          mailCc: [],
          mailBcc: [],
          mailReceipients: [],
          mailAttachments: [],
          sender: mailHeadResp.sender,
          reply_to: mailHeadResp.sender,
          creationTime: new Date(mailHeadResp.date),
          mailServerId: mailHeadResp.mailServerId,
          mailHeadId: mailHeadResp.mailHeadId,
          mailFlagId: mailHeadResp.mailLabel,
          spam: mailHeadResp.spam,
          trashed: mailHeadResp.trashed,
          archived: mailHeadResp.archived
        }

        this.appMails.mailHeads.push(fetchedMailHead)

      })

      for (let mailFlag of this.appMails.mailFlags){

        if (mailFlag.flagId === flagId){

          this.appMails.chosenFlag=mailFlag

        }

      }

      this.appRouter.navigateByUrl('mails/mailsList')


    }).catch((err: any) =>{

      console.error(err);

    })

  }

  createMailAccount(){

    const accName: string = this.eleRef.nativeElement.querySelector('.accountNameIpt').value;
    const accAddress: string = this.eleRef.nativeElement.querySelector('.accountAddressIpt').value;
    const accPass: string = this.eleRef.nativeElement.querySelector('.accountPasswordIpt').value;
    const accServer: string = this.eleRef.nativeElement.querySelector('.accountServer').value;
    const domain: string = this.appOrg.getOrganization().orgDomain;
    const subdomain: string = this.appDep.getDepartment().departmentID;
    const profileLink: string = this.appMemb.getMainMember().memberId;
    const accountType: string = this.appMails.mailAccountType;

    if (accName !== '' && accAddress!== '' && accPass !== ''){

      const accountCreationForm: FormData = new FormData()

      accountCreationForm.append('name',accName)
      accountCreationForm.append('address',accAddress)
      accountCreationForm.append('password',accPass)
      accountCreationForm.append('domain',domain)
      accountCreationForm.append('subdomain',subdomain)
      accountCreationForm.append('profileLink',profileLink)
      accountCreationForm.append('accountType',accountType)
      accountCreationForm.append('serverAddress',accServer)

      this.showLoader('Creating Account').then((loadingEle: HTMLIonLoadingElement) =>{

        this.appHttp.postHttp(accountCreationForm,'/mails/createMailAccount').then((accountCreationResp: any) =>{

          loadingEle.dismiss()

          if (accountCreationResp.status === 0){

            this.showAlert('Account Creation','Account creation failed.')

          }else if (accountCreationResp.status === 1){

            this.showAlert('Account Creation','Successfully created Member Mail account')
          }else if (accountCreationResp.status === 2){

            this.showAlert('Account Creation','Successfully created Department Mail account')

          }else if (accountCreationResp.status === 3){

            this.showAlert('Account Change','Successfully changed account details.')

          }

        }).catch((err: any) =>{

          loadingEle.dismiss()
          this.showAlert('Account Creation', 'Account creation failed, please try again.')
          console.error(err);

        })

      })

    }else{

      this.showAlert('Account Creation','Please fill all required fields')

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
