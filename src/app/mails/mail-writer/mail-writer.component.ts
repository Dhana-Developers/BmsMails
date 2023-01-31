import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

import { Storage } from '@ionic/storage';

import { MailsAttachmentModalComponent } from '../mails-attachment-modal/mails-attachment-modal.component';

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
    private appHttp: HttpService,
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
    this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

      systemDrafts.forEach((systemDraft: Draft) =>{

        if (systemDraft.mailHead.mailObjectId === this.mailService.mailHead.mailObjectId){

          const mailAttachments: Array<string>=[]
          this.mailService.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

            const idbMailAtt: any={
              attId: mailAtt.attId,
              attName: mailAtt.attName,
              attType: mailAtt.attType,
              attExt: mailAtt.attExt,
              objectId: mailAtt.objectId,
              attLink: mailAtt.attLink?.href
            }

            mailAttachments.push(idbMailAtt)

          })

          const idbMailHead: any={
            mailObjectId: this.mailService.mailHead.mailObjectId,
            mailSubject: this.mailService.mailHead.mailSubject,
            mailCc: this.mailService.mailHead.mailCc,
            mailBcc: this.mailService.mailHead.mailBcc,
            mailReceipients: this.mailService.mailHead.mailReceipients,
            mailAttachments,
            sender: this.mailService.mailHead.sender,
            reply_to: this.mailService.mailHead.reply_to
          }

          systemDraft.mailHead = idbMailHead

        }

      })
      this.appStorage.set('drafts',systemDrafts)

    })
  }

  addRecipient():void{

    const receipientContact: any = this.eleRef.nativeElement.querySelector('.receipientContact');

    if (!this.mailService.mailHead.mailReceipients.includes(receipientContact.value)){

      this.mailService.mailHead.mailReceipients.push(receipientContact.value);
      this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

        systemDrafts.forEach((systemDraft: Draft) =>{

          if (systemDraft.mailHead.mailObjectId === this.mailService.mailHead.mailObjectId){

            const mailAttachments: Array<string>=[]
            this.mailService.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

              const idbMailAtt: any={
                attId: mailAtt.attId,
                attName: mailAtt.attName,
                attType: mailAtt.attType,
                attExt: mailAtt.attExt,
                objectId: mailAtt.objectId,
                attLink: mailAtt.attLink?.href
              }

              mailAttachments.push(idbMailAtt)

            })

            const idbMailHead: any={
              mailObjectId: this.mailService.mailHead.mailObjectId,
              mailSubject: this.mailService.mailHead.mailSubject,
              mailCc: this.mailService.mailHead.mailCc,
              mailBcc: this.mailService.mailHead.mailBcc,
              mailReceipients: this.mailService.mailHead.mailReceipients,
              mailAttachments,
              sender: this.mailService.mailHead.sender,
              reply_to: this.mailService.mailHead.reply_to
            }

            systemDraft.mailHead = idbMailHead

          }

        })

        this.appStorage.set('drafts',systemDrafts)

      })
      receipientContact.value=''

    }

  }

  addCcOrBcc():void{

    const receipientContact: any = this.eleRef.nativeElement.querySelector('.ccOrBccInputTxt');

    if (this.ccOrBccFlag === 'Cc'){


      if (!this.mailService.mailHead.mailCc.includes(receipientContact.value)){

        this.mailService.mailHead.mailCc.push(receipientContact.value);
        this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

          systemDrafts.forEach((systemDraft: Draft) =>{

            if (systemDraft.mailHead.mailObjectId === this.mailService.mailHead.mailObjectId){

              const mailAttachments: Array<string>=[]
              this.mailService.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

                const idbMailAtt: any={
                  attId: mailAtt.attId,
                  attName: mailAtt.attName,
                  attType: mailAtt.attType,
                  attExt: mailAtt.attExt,
                  objectId: mailAtt.objectId,
                  attLink: mailAtt.attLink?.href
                }

                mailAttachments.push(idbMailAtt)

              })

              const idbMailHead: any={
                mailObjectId: this.mailService.mailHead.mailObjectId,
                mailSubject: this.mailService.mailHead.mailSubject,
                mailCc: this.mailService.mailHead.mailCc,
                mailBcc: this.mailService.mailHead.mailBcc,
                mailReceipients: this.mailService.mailHead.mailReceipients,
                mailAttachments,
                sender: this.mailService.mailHead.sender,
                reply_to: this.mailService.mailHead.reply_to
              }

              systemDraft.mailHead = idbMailHead

            }

          })

          this.appStorage.set('drafts',systemDrafts)

        })
        receipientContact.value=''

      }

    }else{

      if (!this.mailService.mailHead.mailBcc.includes(receipientContact.value)){

        this.mailService.mailHead.mailBcc.push(receipientContact.value);
        this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

          systemDrafts.forEach((systemDraft: Draft) =>{

            if (systemDraft.mailHead.mailObjectId === this.mailService.mailHead.mailObjectId){

              const mailAttachments: Array<string>=[]
              this.mailService.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

                const idbMailAtt: any={
                  attId: mailAtt.attId,
                  attName: mailAtt.attName,
                  attType: mailAtt.attType,
                  attExt: mailAtt.attExt,
                  objectId: mailAtt.objectId,
                  attLink: mailAtt.attLink?.href
                }

                mailAttachments.push(idbMailAtt)

              })

              const idbMailHead: any={
                mailObjectId: this.mailService.mailHead.mailObjectId,
                mailSubject: this.mailService.mailHead.mailSubject,
                mailCc: this.mailService.mailHead.mailCc,
                mailBcc: this.mailService.mailHead.mailBcc,
                mailReceipients: this.mailService.mailHead.mailReceipients,
                mailAttachments,
                sender: this.mailService.mailHead.sender,
                reply_to: this.mailService.mailHead.reply_to
              }

              systemDraft.mailHead = idbMailHead

            }

          })

          this.appStorage.set('drafts',systemDrafts)

        })
        receipientContact.value=''

      }
    }

  }

  removeRecipient(recipient:string):void{

    this.mailService.mailHead.mailReceipients.splice(this.mailService.mailHead.mailReceipients.indexOf(recipient),1)
    this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

      systemDrafts.forEach((systemDraft: Draft) =>{

        if (systemDraft.mailHead.mailObjectId === this.mailService.mailHead.mailObjectId){

          const mailAttachments: Array<string>=[]
          this.mailService.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

            const idbMailAtt: any={
              attId: mailAtt.attId,
              attName: mailAtt.attName,
              attType: mailAtt.attType,
              attExt: mailAtt.attExt,
              objectId: mailAtt.objectId,
              attLink: mailAtt.attLink?.href
            }

            mailAttachments.push(idbMailAtt)

          })

          const idbMailHead: any={
            mailObjectId: this.mailService.mailHead.mailObjectId,
            mailSubject: this.mailService.mailHead.mailSubject,
            mailCc: this.mailService.mailHead.mailCc,
            mailBcc: this.mailService.mailHead.mailBcc,
            mailReceipients: this.mailService.mailHead.mailReceipients,
            mailAttachments,
            sender: this.mailService.mailHead.sender,
            reply_to: this.mailService.mailHead.reply_to
          }

          systemDraft.mailHead = idbMailHead

        }

      })

      this.appStorage.set('drafts',systemDrafts)

    })

  }

  removeCc(recipient:string):void{

    this.mailService.mailHead.mailCc.splice(this.mailService.mailHead.mailCc.indexOf(recipient),1)
    this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

      systemDrafts.forEach((systemDraft: Draft) =>{

        if (systemDraft.mailHead.mailObjectId === this.mailService.mailHead.mailObjectId){

          const mailAttachments: Array<string>=[]
          this.mailService.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

            const idbMailAtt: any={
              attId: mailAtt.attId,
              attName: mailAtt.attName,
              attType: mailAtt.attType,
              attExt: mailAtt.attExt,
              objectId: mailAtt.objectId,
              attLink: mailAtt.attLink?.href
            }

            mailAttachments.push(idbMailAtt)

          })

          const idbMailHead: any={
            mailObjectId: this.mailService.mailHead.mailObjectId,
            mailSubject: this.mailService.mailHead.mailSubject,
            mailCc: this.mailService.mailHead.mailCc,
            mailBcc: this.mailService.mailHead.mailBcc,
            mailReceipients: this.mailService.mailHead.mailReceipients,
            mailAttachments,
            sender: this.mailService.mailHead.sender,
            reply_to: this.mailService.mailHead.reply_to
          }

          systemDraft.mailHead = idbMailHead
        }

      })

      this.appStorage.set('drafts',systemDrafts)

    })

  }


  removeBcc(recipient:string):void{

    this.mailService.mailHead.mailBcc.splice(this.mailService.mailHead.mailBcc.indexOf(recipient),1)
    this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

      systemDrafts.forEach((systemDraft: Draft) =>{

        if (systemDraft.mailHead.mailObjectId === this.mailService.mailHead.mailObjectId){

          const mailAttachments: Array<string>=[]
          this.mailService.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

            const idbMailAtt: any={
              attId: mailAtt.attId,
              attName: mailAtt.attName,
              attType: mailAtt.attType,
              attExt: mailAtt.attExt,
              objectId: mailAtt.objectId,
              attLink: mailAtt.attLink?.href
            }

            mailAttachments.push(idbMailAtt)

          })

          const idbMailHead: any={
            mailObjectId: this.mailService.mailHead.mailObjectId,
            mailSubject: this.mailService.mailHead.mailSubject,
            mailCc: this.mailService.mailHead.mailCc,
            mailBcc: this.mailService.mailHead.mailBcc,
            mailReceipients: this.mailService.mailHead.mailReceipients,
            mailAttachments,
            sender: this.mailService.mailHead.sender,
            reply_to: this.mailService.mailHead.reply_to
          }

          systemDraft.mailHead = idbMailHead

        }

      })

      this.appStorage.set('drafts',systemDrafts)

    })

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

          this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

            systemDrafts.forEach((systemDraft: Draft) =>{

              if (systemDraft.mailHead.mailObjectId === this.mailService.mailHead.mailObjectId){

                const mailAttachments: Array<string>=[]
                this.mailService.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

                  const idbMailAtt: any={
                    attId: mailAtt.attId,
                    attName: mailAtt.attName,
                    attType: mailAtt.attType,
                    attExt: mailAtt.attExt,
                    objectId: mailAtt.objectId,
                    attLink: mailAtt.attLink?.href
                  }

                  mailAttachments.push(idbMailAtt)

                })

                const idbMailHead: any={
                  mailObjectId: this.mailService.mailHead.mailObjectId,
                  mailSubject: this.mailService.mailHead.mailSubject,
                  mailCc: this.mailService.mailHead.mailCc,
                  mailBcc: this.mailService.mailHead.mailBcc,
                  mailReceipients: this.mailService.mailHead.mailReceipients,
                  mailAttachments,
                  sender: this.mailService.mailHead.sender,
                  reply_to: this.mailService.mailHead.reply_to
                }

                systemDraft.mailHead = idbMailHead
                systemDraft.mailBody = this.mailService.mailBody

              }

            })
            this.mailService.mailBody.mailBodyPayload=porcessedBody
            this.appStorage.set('drafts',systemDrafts)

          })

        if(!this.bodyInit){

          evt.target.value = this.mailService.mailBody.mailBodyPayload

          this.bodyInit=true

        }

    }

  }

  sendMail():void{

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
              this.mailService.systemDrafts = systemDrafts
              this.appStorage.set('drafts',systemDrafts)
              loaderCtrl.dismiss()
              this.showAlert('Mail Sent')

            })

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

}
