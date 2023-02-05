import { Component, ElementRef, OnInit } from '@angular/core';

import { LoadingController } from '@ionic/angular';

import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { UserService } from 'src/app/base-services/user/user.service';

import { MailsService } from 'src/app/base-services/mails/mails.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';

@Component({
  selector: 'app-mails-list',
  templateUrl: './mails-list.component.html',
  styleUrls: ['./mails-list.component.scss'],
})
export class MailsListComponent implements OnInit {

  constructor(

    public organization: OrganizationService,
    public department: DepartmentsService,
    public member: MembersService,
    public appUser: UserService,
    public appRouter: Router,
    public mailService: MailsService,
    private appHttp: HttpService,
    private appStorage: Storage,
    private eleRef: ElementRef,
    private loadingCtr: LoadingController

  ) { }

  public months: Array<string>=[

    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'

  ]

  ngOnInit() {

    if (this.appUser.getMainUser().username===''){

      this.appRouter.navigateByUrl('auth/signIn')

    }

  }

  getMonth(monthNumber?: number): string{

    let month: string = ''

    if (monthNumber !== undefined){

      month=this.months[monthNumber]

    }

    return month

  }

  subtractDate(mailDate?: any): number{

    let hoursPast: number = 0

    if (mailDate !== undefined){

      const currentDate: any = new Date();

      const userAge: any = Math.abs(currentDate-mailDate);

      hoursPast = Math.ceil(userAge/(1000*3600));

    }

    return hoursPast

  }

  readMail(flagId: number,mailObjId:number,mailServerId?: string,mailHeadId?:number,):void{

    this.showLoader('Getting Your Mail').then((ionLoader: HTMLIonLoadingElement) =>{


      const mailLServerId:any = mailServerId

      const fetchMailForm: FormData = new FormData()
      fetchMailForm.append('flagId',JSON.stringify(flagId))
      fetchMailForm.append('mailServerId',mailLServerId)
      fetchMailForm.append('mailObjectId',JSON.stringify(mailObjId))
      fetchMailForm.append('accountType',this.mailService.mailAccount.accountType)
      fetchMailForm.append('address',this.mailService.mailAccount.hostLoginAddress)
      fetchMailForm.append('subdomain',this.department.getDepartment().departmentID)
      fetchMailForm.append('profileLink',this.member.getMainMember().memberId)

      this.appHttp.postHttp(fetchMailForm,'/mails/getMailBody').then((resp: any) =>{

        this.mailService.mailObject.mailObjectId = mailObjId

        this.mailService.mailHeads.forEach((mailHead: MailHead) =>{

          if (mailHead.mailHeadId === mailHeadId){

            this.mailService.mailHead=mailHead

          }

        })

        this.mailService.mailHead.mailAttachments=[]

        resp.attachments.forEach((attachment: any) => {

          const mailAtt: MailAttachment={
            attId: attachment.fileId,
            attName: attachment.filename,
            attType: attachment.fileType,
            attExt: attachment.fileExt,
            objectId: mailObjId,
            attLink:new URL(this.appHttp.getBaseLink()+attachment.fileUrl)
          }
          this.mailService.mailHead.mailAttachments.push(mailAtt)

        });

        const mailBody: MailBody={
          mailBodyId: resp.mailBodyId,
          mailBodyParay: [],
          mailObjectId: mailObjId,
          mailBodyPayload:resp.mail_body,
          mailBodyType:resp.bodyType
        }

        const mailContacts: Array<Contact>=[]
        resp.mailContacts.forEach((serverContact: any) => {
          mailContacts.push({
            email: serverContact.email,
            type: serverContact.type
          })
        });
        this.mailService.setMailContacts(mailContacts)

        this.mailService.mailBody=mailBody
        ionLoader.dismiss()
        this.appRouter.navigateByUrl('mails/mailReader')

      }).catch((err: any) =>{

        ionLoader.dismiss()
        console.error(err);

      })

    })

  }

  changeMailFlag(mailObjId: number, flagName: string, evt:any):void{

    this.showLoader('Change Mail To '+flagName).then((loader: HTMLIonLoadingElement) =>{

      const mailsListContent: any = this.eleRef.nativeElement.querySelector('.mailsListContent')
      const headPane: any =this.eleRef.nativeElement.querySelector('#hP'+mailObjId)

      const archiveMailForm: FormData = new FormData()

      let flagToChange: MailFlag = {
        flagId: 0,
        flagName: '',
        flagMd: '',
        flagImapName: '',
        flaColor: ''
      }

      this.mailService.mailFlags.forEach((mailFlag: MailFlag) =>{

        if (mailFlag.flagName === flagName){

          archiveMailForm.append('mailFlagId',JSON.stringify(mailFlag.flagId))

          flagToChange = mailFlag;

        }

      })

      archiveMailForm.append('MailObjId',JSON.stringify(mailObjId))

      this.appHttp.postHttp(archiveMailForm,'/mails/changeFlag').then((resp: any) =>{

        if (this.mailService.chosenFlag.flagName === 'Draft'){

          this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{
            systemDrafts.forEach((systemDraft: Draft) =>{

              if (systemDraft.mailHead.mailObjectId === mailObjId){

                if (flagToChange.flagName === 'Trash'){

                  systemDraft.mailHead.trashed = true

                }else if (flagToChange.flagName === 'Spam'){

                  systemDraft.mailHead.spam = true

                }else if (flagToChange.flagName === 'Archive'){

                  systemDraft.mailHead.archived = true

                }

              }
            })

            this.appStorage.set('drafts',systemDrafts)
            mailsListContent.removeChild(headPane)
            loader.dismiss()

          })

        }else{
          mailsListContent.removeChild(headPane)
          loader.dismiss()
        }

      })


    })

  }

  restoreFlag(mailObjId: number, flagName: string, evt:any):void{

    this.showLoader('Change Mail To '+flagName).then((loader: HTMLIonLoadingElement) =>{

      const mailsListContent: any = this.eleRef.nativeElement.querySelector('.mailsListContent')
      const headPane: any =this.eleRef.nativeElement.querySelector('#hP'+mailObjId)

      const archiveMailForm: FormData = new FormData()

      let flagToChange: MailFlag = {
        flagId: 0,
        flagName: '',
        flagMd: '',
        flagImapName: '',
        flaColor: ''
      }

      this.mailService.mailFlags.forEach((mailFlag: MailFlag) =>{

        if (mailFlag.flagName === flagName){

          archiveMailForm.append('mailFlagId',JSON.stringify(mailFlag.flagId))

          flagToChange = mailFlag;

        }

      })

      archiveMailForm.append('MailObjId',JSON.stringify(mailObjId))

      this.appHttp.postHttp(archiveMailForm,'/mails/restoreFlag').then((resp: any) =>{

        this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{
          systemDrafts.forEach((systemDraft: Draft) =>{

            if (systemDraft.mailHead.mailObjectId === mailObjId){

              if (flagToChange.flagName === 'Trash'){

                systemDraft.mailHead.trashed = false

              }else if (flagToChange.flagName === 'Spam'){

                systemDraft.mailHead.spam = false

              }else if (flagToChange.flagName === 'Archive'){

                systemDraft.mailHead.archived = false

              }

            }
          })

          this.appStorage.set('drafts',systemDrafts)
          mailsListContent.removeChild(headPane)
          loader.dismiss()

        })

      })


    })

  }


  editMail(mailObjId: number):void{

    this.showLoader('Getting Your Draft').then((loader: HTMLIonLoadingElement) =>{

    this.appStorage.get('drafts').then((systemDrafts:Array<any>) =>{

      systemDrafts.forEach((systemDraft: Draft) =>{

        if (systemDraft.mailHead.mailObjectId === mailObjId){

          const mailAttachments: Array<MailAttachment>=[]


          systemDraft.mailHead.mailAttachments.forEach((mailAtt: IdbMailAttachment) =>{

            let mailLinkUrl: any=null

            if (mailAtt.attLink !== undefined){
              mailLinkUrl= new URL(mailAtt.attLink)
            }

            const idbMailAtt: any={
              attId: mailAtt.attId,
              attName: mailAtt.attName,
              attType: mailAtt.attType,
              attExt: mailAtt.attExt,
              objectId: mailAtt.objectId,
              attLink: mailLinkUrl
            }

            mailAttachments.push(idbMailAtt)

          })

          const mailHead: MailHead={
            mailObjectId: systemDraft.mailHead.mailObjectId,
            mailSubject: systemDraft.mailHead.mailSubject,
            mailCc: systemDraft.mailHead.mailCc,
            mailBcc: systemDraft.mailHead.mailBcc,
            mailReceipients: systemDraft.mailHead.mailReceipients,
            mailAttachments,
            sender: systemDraft.mailHead.sender,
            reply_to: systemDraft.mailHead.reply_to,
            mailFlagId: systemDraft.mailHead.mailFlagId,
            spam: systemDraft.mailHead.spam,
            trashed: systemDraft.mailHead.trashed,
            archived: systemDraft.mailHead.archived,
            creationTime: new Date(systemDraft.mailHead.creationTime)
          }

          this.mailService.mailBody.mailBodyPayload=systemDraft.mailBody.mailBodyParay.join('\n')

          this.mailService.mailHead=mailHead
          this.mailService.mailBody=systemDraft.mailBody
          this.mailService.mailObject=systemDraft.mailObject

        }

      })
      loader.dismiss()
      this.mailService.mailSection='Writer'
      this.appRouter.navigateByUrl('mails/mailWriter')

    })

    })

  }

  clearMailFlag():void{

    this.showLoader('Clearing '+this.mailService.chosenFlag.flagName).then((loader: HTMLIonLoadingElement) =>{

      const clearMailFlagForm: FormData = new FormData()

      clearMailFlagForm.append('mailFlagId',JSON.stringify(this.mailService.chosenFlag.flagId))
      clearMailFlagForm.append('logIgn',this.mailService.mailAccount.hostLoginAddress)

      this.appHttp.postHttp(clearMailFlagForm,'/mails/clearMailFlag').then((resp: any) =>{

        this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

          const draftsToDelete: Array<number> = []
          systemDrafts.forEach((systemDraft: Draft) =>{

            if (systemDraft.mailHead.sender === this.mailService.mailAccount.hostLoginAddress){

              if (this.mailService.chosenFlag.flagName === 'Trash'&&
              systemDraft.mailHead.trashed){
                draftsToDelete.push(systemDraft.mailHead.mailObjectId)
              }else if (this.mailService.chosenFlag.flagName === 'Spam'&&
              systemDraft.mailHead.spam){
                draftsToDelete.push(systemDraft.mailHead.mailObjectId)
              }else if (this.mailService.chosenFlag.flagName === 'Archive'&&
              systemDraft.mailHead.archived){
                draftsToDelete.push(systemDraft.mailHead.mailObjectId)
              }

            }
          })

          const filteredDrafts: Array<Draft> = systemDrafts.filter((systemDraft: Draft) => !draftsToDelete.includes(systemDraft.mailHead.mailObjectId))

          this.appStorage.set('drafts',filteredDrafts)
          this.mailService.mailHeads=[]
          loader.dismiss()
        })

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

  setFlagNameTo(title: string){

    this.eleRef.nativeElement.querySelector('.titleTag').innerText = title;

  }

  getSearchedMails(evt: any){

    if (evt.target.value !==''){

      this.searchMails(evt.target.value);

    }

  }


  searchMails(searchTerm: string){
    const fetchMailHeadsForm: FormData = new FormData()
    fetchMailHeadsForm.append('accountType',this.mailService.mailAccount.accountType)
    fetchMailHeadsForm.append('profileLink',this.member.getMainMember().memberId)
    fetchMailHeadsForm.append('subdomain',this.department.getDepartment().departmentID)
    fetchMailHeadsForm.append('address',this.mailService.mailAccount.hostLoginAddress)
    fetchMailHeadsForm.append('searchTerm',searchTerm)

    this.appHttp.postHttp(fetchMailHeadsForm,'/mails/searchMails').then((resp: Array<any>) =>{

      this.mailService.mailHeads=[]

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
        this.mailService.mailHeads.push(fetchedMailHead)

      })

    }).catch((err: any) =>{
      console.error(err);

    })
  }

  processHtml(payload: any): any{

    let parser = new DOMParser();
    const innerDoc = parser.parseFromString(payload, 'text/html');

    const initArray: Array<Element> = []

    for (let index = 0; index < innerDoc.body.children.length; index++) {
      const element = innerDoc.body.children[index];
      initArray.push(element)

    }

    const initChildrenList: Array<Element>=this.getChildren(initArray,0)

    const widthLimitedElements: Array<Element> = this.limitWidth(initChildrenList)

    return widthLimitedElements

  }

  getChildren(initChildrenList: Array<Element>, last_mail:number):Array<Element>{

    for (let index = last_mail; index < initChildrenList.length; index++) {
      const initChild = initChildrenList[index];

      if (initChild.children!== undefined){

        for (let index = 0; index < initChild.children.length; index++) {
          const element = initChild.children[index];
          initChildrenList.push(element)
        }

      }

    }

    return initChildrenList

  }

  limitWidth(innerElements:Array<Element>): Array<Element>{

    const widthLimitedElements: Array<Element> = []

    innerElements.forEach((innerElement: any) =>{

      if (innerElement.width!==undefined && innerElement.width!==''){

        if (Number(innerElement.width)>window.innerWidth){
          innerElement.width = 100+'%';
          innerElement.style.maxWidth=100+'%';
        }
        widthLimitedElements.push(innerElement)
      }

    })

    return widthLimitedElements

  }

}
