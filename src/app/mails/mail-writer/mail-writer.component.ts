import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

import { Storage } from '@ionic/storage';

import { MailsAttachmentModalComponent } from '../mails-attachment-modal/mails-attachment-modal.component';
import { FootersComponent } from '../footers/footers.component';

import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { UserService } from 'src/app/base-services/user/user.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';

import { HttpService } from 'src/app/base-services/comms/http/http.service';

@Component({
  selector: 'app-mail-writer',
  templateUrl: './mail-writer.component.html',
  styleUrls: ['./mail-writer.component.scss'],
})
export class MailWriterComponent implements OnInit,AfterViewInit {

  public ccOrBccFlag = 'Cc';
  public currentWords=0;
  public wordCounter=0;
  public bodyInit = false;
  public headInit = false;
  private selectedContactInput: any = null

  constructor(
    private eleRef: ElementRef,
    public organization: OrganizationService,
    private department: DepartmentsService,
    private members: MembersService,
    public mailService: MailsService,
    private mdlCtr: ModalController,
    private appUser: UserService,
    private appRouter: Router,
    private appStorage: Storage,
    public appHttp: HttpService,
    private loadingController:LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {

    if (this.appUser.getMainUser().username === ''){
      this.appRouter.navigateByUrl('auth/signIn')
    }

  }

  ngAfterViewInit(): void {
  }


  setSubject(evt: any): void{

    if(!this.headInit){

      evt.target.value = this.mailService.mailHead.mailSubject

      this.headInit=true

    }
    const mailSubject: string = evt.target.value;
    this.mailService.mailHead.mailSubject=mailSubject;
    this.mailService.setDraft()
  }

  addRecipient():void{

    const receipientContact: any = this.eleRef.nativeElement.querySelector('.receipientContact');

    if (!this.mailService.mailHead.mailReceipients.includes(receipientContact.value)){

      this.mailService.mailHead.mailReceipients.push(receipientContact.value);
      this.mailService.setDraft()
      receipientContact.value=''

    }

  }

  addCcOrBcc():void{

    const receipientContact: any = this.eleRef.nativeElement.querySelector('.ccOrBccInputTxt');

    if (this.ccOrBccFlag === 'Cc'){


      if (!this.mailService.mailHead.mailCc.includes(receipientContact.value)){

        this.mailService.mailHead.mailCc.push(receipientContact.value);
        receipientContact.value=''

      }

    }else{

      if (!this.mailService.mailHead.mailBcc.includes(receipientContact.value)){

        this.mailService.mailHead.mailBcc.push(receipientContact.value);
        receipientContact.value=''

      }
    }
    
    this.mailService.setDraft()

  }

  removeRecipient(recipient:string):void{

    this.mailService.mailHead.mailReceipients.splice(this.mailService.mailHead.mailReceipients.indexOf(recipient),1)
    this.mailService.setDraft()

  }

  removeCc(recipient:string):void{

    this.mailService.mailHead.mailCc.splice(this.mailService.mailHead.mailCc.indexOf(recipient),1)
    this.mailService.setDraft()

  }


  removeBcc(recipient:string):void{

    this.mailService.mailHead.mailBcc.splice(this.mailService.mailHead.mailBcc.indexOf(recipient),1)

      this.mailService.setDraft()

  }


  openCcOrBcc(type: string):void{

    this.ccOrBccFlag=type
    const ccOrBccInput: any = this.eleRef.nativeElement.querySelector('.ccOrBccInput')
    ccOrBccInput.classList.remove('nosite')

  }
  createAttachmentModal(): void{

    this.mdlCtr.create({
      component: MailsAttachmentModalComponent
    }).then((paymentMdl: HTMLIonModalElement) => {

      paymentMdl.present();

    });

  }
  getMailBoddy(evt: any): void{

    const mailBody: string = evt.target.value

    if (mailBody !== '' && mailBody!== undefined){

        if(!this.bodyInit){

          evt.target.value = this.mailService.mailBody.mailBodyPayload

          this.bodyInit=true

        }
        const bodyTexts:Array<string> = mailBody.split(' ')

        const mailsInBody: Array<string>=[]

        bodyTexts.forEach((bodyText: string) =>{

          if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(bodyText)){

            mailsInBody.push(bodyText);

          }

        })

        const identifiedMails: Array<string>=[]
        let bodyToProcess:string = ''

        if (mailsInBody.length>0){
          mailsInBody.forEach((mailInBody: string) =>{

            const mailToProcess:string = mailInBody.replace('.','__dtsd__')
            identifiedMails.push(mailToProcess)
            bodyToProcess=mailBody.replace(mailInBody,mailToProcess)

          })
        }else{
          bodyToProcess=mailBody
        }

        const bodyToProcessLines: Array<string> = bodyToProcess.split('.')
        const processedBodyLines:Array<string> = []

        bodyToProcessLines.forEach((bodyToProcessLine: string)=>{
            const trimmedBodyPara: string = bodyToProcessLine.trim()
            processedBodyLines.push(' '+trimmedBodyPara.charAt(0).toUpperCase() + trimmedBodyPara.slice(1))
        })

        let porcessedBody = processedBodyLines.join('.')

        identifiedMails.forEach((identifiedMail: string) =>{

          const porcessedMail:string = identifiedMail.replace('__dtsd__','.')
          porcessedBody=porcessedBody.replace(identifiedMail,porcessedMail)

        })

        const bodyParas: Array<string>=porcessedBody.split('\n')

        this.mailService.mailBody.mailBodyParay=bodyParas

        this.mailService.mailBody.mailBodyPayload=porcessedBody

        this.mailService.setDraft()

    }

  }

  sendMail():void{
    let flagId = 0;
    this.mailService.mailFlags.forEach((mailFlag: MailFlag) =>{

      if (mailFlag.flagName === 'Sent'){

        flagId = mailFlag.flagId

      }

    })

    const sendMailForm: FormData = new FormData()

    const attmtLink: Array<any>=[]

    this.mailService.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

      attmtLink.push(mailAtt.attLink?.pathname)

    })

    sendMailForm.append('address',this.mailService.mailAccount.hostLoginAddress)
    sendMailForm.append('subdomain',this.department.getDepartment().departmentID)
    sendMailForm.append('profileLink',this.members.getMainMember().memberId)
    sendMailForm.append('accountType',this.mailService.mailAccount.accountType)
    sendMailForm.append('paras',JSON.stringify(this.mailService.mailBody.mailBodyParay))
    sendMailForm.append('attachments',JSON.stringify(attmtLink))
    sendMailForm.append('receivers',JSON.stringify(this.mailService.mailHead.mailReceipients.concat(
      this.mailService.mailHead.mailCc,this.mailService.mailHead.mailBcc
    )))
    sendMailForm.append('subject',this.mailService.mailHead.mailSubject)
    sendMailForm.append('cc',JSON.stringify(this.mailService.mailHead.mailCc))
    sendMailForm.append('bcc',JSON.stringify(this.mailService.mailHead.mailBcc))
    sendMailForm.append('objId',JSON.stringify(this.mailService.mailObject.mailObjectId))
    sendMailForm.append('mailFlagId',JSON.stringify(flagId))

    sendMailForm.append('mailFooterPresent',JSON.stringify(this.mailService.mailFooterPresent))
    sendMailForm.append('footerRecords',JSON.stringify(this.mailService.chosenFooter.footerRecords))
    sendMailForm.append('footerMediaPresent',JSON.stringify(this.mailService.chosenFooter.img))
    sendMailForm.append('footerMedia',JSON.stringify(this.mailService.chosenFooter.footerMedia))
    sendMailForm.append('salutation',this.mailService.chosenFooter.salutation)
    sendMailForm.append('baseUrl',this.appHttp.getBaseLink())

    const receivers = this.mailService.mailHead.mailReceipients.concat(
      this.mailService.mailHead.mailCc,this.mailService.mailHead.mailBcc
    )

    if (receivers.length>0){

      this.showLoader('Sending your mail').then((loaderCtrl: any) =>{


        this.appHttp.postHttp(sendMailForm,'/mails/sendMail').then((resp: any) =>{
          loaderCtrl.dismiss()

          if (resp.msgSent=== true){

            let msgIndex:number = 0;

            this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

              systemDrafts.forEach((systemDraft: Draft) =>{

                if (systemDraft.mailObject.mailObjectId === this.mailService.mailObject.mailObjectId){

                  systemDrafts.splice(msgIndex,1)

                }
                msgIndex+=1

              })
              this.appStorage.set('drafts',systemDrafts)
              this.showAlert('Mail Sent')

            })

          }else{
            this.showAlert('Mail Not Sent')
          }

        }).catch((err: any) =>{
          loaderCtrl.dismiss()
          this.showAlert('Mail Not Sent')

          console.error(err);

        })

      })
    }else{

      this.showAlert('Please enter atleast one receiver. Click the \'add\' button to add receiver')

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

  showAlert(msg: string): Promise<HTMLIonAlertElement>{

    return new Promise<HTMLIonAlertElement>((resolve) => {

      this.alertCtrl.create({
        message: msg,
        buttons:[
          {
            text:'OK',
            role:'cancel'
          }
        ]
      }).then((altctrl: HTMLIonAlertElement) =>{

        altctrl.present()

        resolve(altctrl)

      })

    })

  }

  createFootersModal(): void{

    const getFootersForm: FormData = new FormData()

    getFootersForm.append('address',this.mailService.mailAccount.hostLoginAddress)

    this.showLoader('Getting Available footers').then((loadingEle: HTMLIonLoadingElement) =>{

      this.appHttp.postHttp(getFootersForm,'/mails/getFooters').then((mailFooters: any) =>{

        loadingEle.dismiss()

        this.mailService.mailFooters = mailFooters

        this.mdlCtr.create({
          component: FootersComponent
        }).then((footersMdl: HTMLIonModalElement) => {

          footersMdl.present();

        });

      }).catch((err: any) =>{

        loadingEle.dismiss()
        console.log(err);
        this.showAlert('Error occured please try again.')

      })

    })

  }

  searcheContact(evt: any){

    this.mailService.searchedContacts=[]
    this.selectedContactInput = evt.target

    if (evt.target.value !== ''){


      this.mailService.searchContact(evt.target.value)

    }

  }

  selectContact(contact: string){

    if (this.selectedContactInput !== null){

      if (this.selectedContactInput.classList.contains('receipientContact')){

        this.mailService.mailHead.mailReceipients.push(contact)

      }else{

        if (this.ccOrBccFlag === 'Cc'){

          this.mailService.mailHead.mailCc.push(contact)

        }else{

          this.mailService.mailHead.mailBcc.push(contact)
        }

      }

      this.mailService.setDraft()

      this.mailService.searchedContacts = []
      this.selectedContactInput.value=''

    }

  }

}
