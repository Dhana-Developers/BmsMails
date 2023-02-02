import { Component, OnInit, ElementRef, AfterContentChecked } from '@angular/core';
import { Router } from '@angular/router';

import { ModalController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { Storage } from '@ionic/storage';

import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { UserService } from 'src/app/base-services/user/user.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';

import { MailsAttachmentModalComponent } from '../mails-attachment-modal/mails-attachment-modal.component';

@Component({
  selector: 'app-mail-reader',
  templateUrl: './mail-reader.component.html',
  styleUrls: ['./mail-reader.component.scss'],
})
export class MailReaderComponent implements OnInit, AfterContentChecked {


  public months: Array<string>=[

    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'

  ]
  constructor(

    public org: OrganizationService,
    public dept: DepartmentsService,
    public member: MembersService,
    public appUser: UserService,
    public appMails: MailsService,
    private appHttp: HttpService,
    private mdlCtr: ModalController,
    private appRouter: Router,
    private eleRef: ElementRef,
    private loadingCtr: LoadingController,
    private appStorage: Storage,
    private alertCtrl: AlertController

  ) { }

  ngOnInit() {

    if (this.appUser.getMainUser().username === ''){

      this.appRouter.navigateByUrl('auth/signIn')

    }

  }
  ngAfterContentChecked(): void {
      const mailContent: any = this.eleRef.nativeElement.querySelector('.mailContent')

      if (this.appMails.mailBody.mailBodyType === 'HTML'){

        mailContent.innerHTML=this.appMails.mailBody.mailBodyPayload

      }else{
        mailContent.innerText = this.appMails.mailBody.mailBodyPayload
      }

  }
  createAttachmentModal(): void{

    this.mdlCtr.create({
      component: MailsAttachmentModalComponent
    }).then((paymentMdl: HTMLIonModalElement) => {

      paymentMdl.present();

    });

  }

  getMonth(monthNumber?: number): string{

    let month: string = ''

    if (monthNumber !== undefined){

      month=this.months[monthNumber]

    }

    return month

  }



  composeMail(recipientContact: string):void{

    const composeMailForm: FormData = new FormData()

    this.showLoader('Composing Mail').then((mailLoader: HTMLIonLoadingElement) =>{

      let flagId = 0;
      this.appMails.mailFlags.forEach((mailFlag: MailFlag) =>{

        if (mailFlag.flagName === 'Draft'){

          flagId = mailFlag.flagId

        }

      })

      composeMailForm.append('address',this.appMails.mailAccount.hostLoginAddress)
      composeMailForm.append('mailFlagId',JSON.stringify(flagId))
      composeMailForm.append('accountType',this.appMails.mailAccount.accountType)
      composeMailForm.append('profileLink',this.member.getMainMember().memberId)
      composeMailForm.append('subdomain',this.dept.getDepartment().departmentID)

      this.appHttp.postHttp(composeMailForm,'/mails/getMailObject').then((mailObjectResp:any) =>{

        this.appMails.mailObject={
          userAccount: this.appMails.mailAccount.hostLoginAddress,
          mailFlag: String(flagId),
          mailObjectId: mailObjectResp.mail_object_id
        }

        this.appMails.mailHead={
          mailObjectId: mailObjectResp.mail_object_id,
          mailSubject: '',
          mailCc: [],
          mailBcc: [],
          mailReceipients: [recipientContact],
          mailAttachments: [],
          sender: mailObjectResp.sender,
          reply_to: mailObjectResp.reply_to,
          creationTime: new Date(mailObjectResp.mailHeadTime),
          mailFlagId:flagId,
          spam: mailObjectResp.spam,
          trashed: mailObjectResp.trashed,
          archived: mailObjectResp.archived
        }

        this.appMails.mailBody={

          mailBodyId: mailObjectResp.mailBodyId,
          mailBodyParay: [],
          mailObjectId: mailObjectResp.mail_object_id
        }
        this.appStorage.get('drafts').then((systemDrafts: Array<Draft>) =>{
          this.appMails.systemDrafts=[]

          const currentDraft: Draft = {
            mailObject: this.appMails.mailObject,
            mailHead: this.appMails.mailHead,
            mailBody: this.appMails.mailBody
          }

          if (systemDrafts !== null){

            systemDrafts.push(currentDraft)
            this.appStorage.set('drafts', systemDrafts)

            systemDrafts.forEach((systemDraft: any) =>{

              if (systemDraft.mailHead.sender === this.appMails.mailAccount.hostLoginAddress){

                this.appMails.systemDrafts.push(systemDraft);

              }

            })

          }else{

            this.appStorage.set('drafts', [currentDraft])

            this.appMails.systemDrafts = [currentDraft]

          }

        }).catch((err: any) =>{

          console.error(err);

        })

        this.appMails.mailSection='Writer'

        mailLoader.dismiss()

        this.appRouter.navigateByUrl('mails/mailWriter')

      }).catch((err: any) =>{

        mailLoader.dismiss()

        console.error(err);

      })

    })

  }

  showLoader(loaderTxt:string): Promise<HTMLIonLoadingElement>{

    return new Promise<any>((resolve) => {

      this.loadingCtr.create({
        message:loaderTxt
      }).then((loader:HTMLIonLoadingElement) =>{

        loader.present()

        resolve(loader)

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
            text:'Cancel',
            role:'cancel'
          },

          {
            text:'Ok',
            role:'reply'
          }

        ]
      }).then((alertEle: HTMLIonAlertElement) =>{

        alertEle.present()

        resolve(alertEle)

      })

    })

  }

  replyTo(recipientContact: string){

    this.showAlert('Reply', 'Reply to '+recipientContact).then((alertEle: HTMLIonAlertElement) =>{

      alertEle.onDidDismiss().then((evtOverlay: any) =>{

        if (evtOverlay.role === 'reply'){

          this.composeMail(recipientContact)

        }

      })

    })

  }

  showInputAlert(alertTitle:string, alertMsg: string): Promise<HTMLIonAlertElement>{

    return new Promise<HTMLIonAlertElement>((resolve, reject) => {

      this.alertCtrl.create({
        header:alertTitle,
        message: alertMsg,
        buttons:[

          {
            text:'Cancel',
            role:'cancel'
          },

          {
            text:'Ok',
            role:'forward'
          }

        ],
        inputs:[
          {
            placeholder: 'Recipient Email',
            name: 'userContact'
          },
        ]
      }).then((alertEle: HTMLIonAlertElement) =>{

        alertEle.present()

        resolve(alertEle)

      })

    })

  }

  forwardEmail(){

    this.showInputAlert('Forwarding','Input contact to forward to.').then((alertEle: HTMLIonAlertElement) =>{

      alertEle.onDidDismiss().then((overlayEvent: any) =>{

        if (overlayEvent.role == 'forward'){

          if (overlayEvent.data.values.userContact === ''){

            this.showAlert('Mail Forwarding','Please fill all required details.')

          }else{

            const mailForwardingForm: FormData = new FormData()

            mailForwardingForm.append('mailObjId',JSON.stringify(this.appMails.mailObject.mailObjectId));
            mailForwardingForm.append('receivers',JSON.stringify([overlayEvent.data.values.userContact]))

            this.showLoader('Forwarding').then((loadingEle: any) =>{

              this.appHttp.postHttp(mailForwardingForm,'/mails/forwardMail').then((resp: any) =>{

                loadingEle.dismiss()

                if (resp.status === 1){

                  this.showAlert('Mail Forwarding','Mail forwarded')

                }else{

                  this.showAlert('Mail Forwarding','Mail forwarding failed')

                }

              }).catch((err: any) =>{

                console.error(err);
                loadingEle.dismiss()
                this.showAlert('Mail Forwarding','Error occured, please try again.')

              })

            })

          }

        }

      })

    })

  }

}
