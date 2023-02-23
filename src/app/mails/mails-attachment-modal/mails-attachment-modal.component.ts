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
      this.appMails.setDraft()

    })

  }

  removeAtt(attId:number):void{

    let attIndex=0;

    this.appMails.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

      if (mailAtt.attId === attId){

        this.appMails.mailHead.mailAttachments.splice(attIndex,1);
        this.appMails.setDraft()

      }

      attIndex+=1

    })

  }

  get_att_media(mailAttMediaURL: any,filename: string){

    this.appHttp.getHttp(`/mails${mailAttMediaURL.pathname}`,'file').then((resp: any) =>{

      const attFile = new FileReader()

      attFile.onloadend=()=>{

        const downloadBut: any = document.createElement('a')
        downloadBut.download = filename
        downloadBut.href = attFile.result

        downloadBut.click()

      }

      attFile.readAsDataURL(resp)

    }).catch((err: any) =>{

      console.log(err);

    })

  }

}
