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

      // const mailReader: any = this.eleRef.nativeElement.querySelector('.mailReader')

      // this.appMails.mailBody.mailBodyParay.forEach((mailPara: any) =>{

      //   mailReader.appendChild(mailPara)

      // })

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



  composeMail(recipientContacts: Array<string>,cc:Array<string>,bcc: Array<string>):void{

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
          mailCc: cc,
          mailBcc: bcc,
          mailReceipients: recipientContacts,
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
        this.appMails.setDraft(true)

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

  showAlert(alertMsg: string): Promise<HTMLIonAlertElement>{

    return new Promise<HTMLIonAlertElement>((resolve, reject) => {

      let alertButtons: Array<any>=
      [

        {
          text:'Cancel',
          role:'cancel'
        },
        {
          text:'Ok',
          role:'reply'
        }

      ]

      if (this.appMails.getMailContacts().length>0){

        alertButtons =
        [

          {
            text:'Cancel',
            role:'cancel'
          },
          {
            text:'Reply All',
            role:'replyall'
          },
          {
            text:'Ok',
            role:'reply'
          }

        ]

      }

      this.alertCtrl.create({
        message: alertMsg,
        buttons: alertButtons
      }).then((alertEle: HTMLIonAlertElement) =>{

        alertEle.present()

        resolve(alertEle)

      })

    })

  }

  showNativeAlert(title: string,msg: string): Promise<HTMLIonAlertElement>{

    return new Promise<HTMLIonAlertElement>((resolve, reject) => {

      this.alertCtrl.create({
        header: title,
        message: msg,
        buttons:[
          {
            text:'Ok',
            role:'cancel'
          }

        ]
      }).then((alertEle: HTMLIonAlertElement) =>{

        alertEle.present()

        resolve(alertEle)

      })

    })
  }

  replyTo(recipientContact: string){

    this.showAlert('Reply to '+recipientContact).then((alertEle: HTMLIonAlertElement) =>{

      alertEle.onDidDismiss().then((evtOverlay: any) =>{

        if (evtOverlay.role === 'reply'){

          this.composeMail([recipientContact],[],[])

        }else if (evtOverlay.role === 'replyall'){

          const mailBcc: Array<string> = []
          const mailCc: Array<string> = []
          const mailReceipients: Array<string> = []

          this.appMails.getMailContacts().forEach((mailContact: Contact) =>{

            if (mailContact.type === 'cc'){
              mailCc.push(mailContact.email)
            }else if (mailContact.type === 'bcc'){
              mailBcc.push(mailContact.email)
            }else{
              mailReceipients.push(mailContact.email)
            }

          })

          this.composeMail(mailReceipients,mailCc,mailBcc)

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

            this.showNativeAlert('Mail Forwarding','Please fill all required details.')

          }else{

            const mailForwardingForm: FormData = new FormData()

            mailForwardingForm.append('mailObjId',JSON.stringify(this.appMails.mailObject.mailObjectId));
            mailForwardingForm.append('receivers',JSON.stringify([overlayEvent.data.values.userContact]))

            this.showLoader('Forwarding').then((loadingEle: any) =>{

              this.appHttp.postHttp(mailForwardingForm,'/mails/forwardMail').then((resp: any) =>{

                loadingEle.dismiss()

                if (resp.status === 1){

                  this.showNativeAlert('Mail Forwarding','Mail forwarded')

                }else{

                  this.showNativeAlert('Mail Forwarding','Mail forwarding failed')

                }

              }).catch((err: any) =>{

                console.error(err);
                loadingEle.dismiss()
                this.showNativeAlert('Mail Forwarding','Error occured, please try again.')

              })

            })

          }

        }

      })

    })

  }

}
