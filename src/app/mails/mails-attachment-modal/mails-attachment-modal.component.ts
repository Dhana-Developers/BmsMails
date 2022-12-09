import { Component, OnInit, ElementRef } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { MailsService } from 'src/app/base-services/mails/mails.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';

@Component({
  selector: 'app-mails-attachment-modal',
  templateUrl: './mails-attachment-modal.component.html',
  styleUrls: ['./mails-attachment-modal.component.scss'],
})
export class MailsAttachmentModalComponent implements OnInit {



  constructor(
    private modalCtrl: ModalController,
    public appMails: MailsService,
    private eleRef: ElementRef,
    private appHttp: HttpService,
    private appStorage: Storage
    ) { }

  ngOnInit() {}

  cancel(){

    return this.modalCtrl.dismiss(null, 'cancel');

  }
  openFileSelector():void{

    const attFileInput: any = this.eleRef.nativeElement.querySelector('.attFileInput')

    attFileInput.click()

  }

  readFile(evt: any):void{

    const attFile: File = evt.target.files[0];
    const fileTypeList = attFile.type.split('/')

    const mailAtt: MailAttachment={
      attId: 0,
      attName: '',
      attType: '',
      attLink: undefined,
      attExt: '',
      objectId: 0
    }

    mailAtt.attName = attFile.name
    mailAtt.attType = fileTypeList[0]
    mailAtt.objectId = this.appMails.mailObject.mailObjectId

    const addAttForm: FormData= new FormData()

    addAttForm.append('attFile',attFile)
    addAttForm.append('fileName',attFile.name)
    addAttForm.append('fileType',fileTypeList[0])
    addAttForm.append('objectId',JSON.stringify(this.appMails.mailObject.mailObjectId))

    this.appHttp.postHttp(addAttForm,'/mails/addAttachment').then((resp: any) =>{

      mailAtt.attExt = resp.attExt
      mailAtt.attId = resp.attId
      mailAtt.attLink = new URL(`${this.appHttp.getBaseLink()}${resp.attLink}`)

      this.appMails.mailHead.mailAttachments.push(mailAtt)
      this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

        systemDrafts.forEach((systemDraft: Draft) =>{

          const mailAttachments: Array<string>=[]

          if (systemDraft.mailHead.mailObjectId === this.appMails.mailHead.mailObjectId){

            this.appMails.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

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
              mailObjectId: this.appMails.mailHead.mailObjectId,
              mailSubject: this.appMails.mailHead.mailSubject,
              mailCc: this.appMails.mailHead.mailCc,
              mailBcc: this.appMails.mailHead.mailBcc,
              mailReceipients: this.appMails.mailHead.mailReceipients,
              mailAttachments,
              sender: this.appMails.mailHead.sender,
              reply_to: this.appMails.mailHead.reply_to
            }

            systemDraft.mailHead = idbMailHead

          }

        })

        this.appStorage.set('drafts',systemDrafts)

      })

    })

  }

  removeAtt(attId:number):void{

    let attIndex=0;

    this.appMails.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

      if (mailAtt.attId === attId){

        this.appMails.mailHead.mailAttachments.splice(attIndex,1);
        this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

          systemDrafts.forEach((systemDraft: Draft) =>{

            if (systemDraft.mailHead.mailObjectId === this.appMails.mailHead.mailObjectId){

              const mailAttachments: Array<string>=[]
              this.appMails.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

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
                mailObjectId: this.appMails.mailHead.mailObjectId,
                mailSubject: this.appMails.mailHead.mailSubject,
                mailCc: this.appMails.mailHead.mailCc,
                mailBcc: this.appMails.mailHead.mailBcc,
                mailReceipients: this.appMails.mailHead.mailReceipients,
                mailAttachments,
                sender: this.appMails.mailHead.sender,
                reply_to: this.appMails.mailHead.reply_to
              }

              systemDraft.mailHead = idbMailHead

            }

          })

          this.appStorage.set('drafts',systemDrafts)

        })

      }

      attIndex+=1

    })

  }

}
