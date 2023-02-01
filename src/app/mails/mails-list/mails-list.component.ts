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

      this.mailService.mailFlags.forEach((mailFlag: MailFlag) =>{

        if (mailFlag.flagName === flagName){

          archiveMailForm.append('mailFlagId',JSON.stringify(mailFlag.flagId))

        }

      })

      archiveMailForm.append('MailObjId',JSON.stringify(mailObjId))

      this.appHttp.postHttp(archiveMailForm,'/mails/changeFlag').then((resp: any) =>{

        if (this.mailService.chosenFlag.flagName === 'Draft'){

          this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{
            let newSystemDrafts:Array<Draft>=[]
            let draftId:number = 0;
            systemDrafts.forEach((systemDraft: Draft) =>{

              if (systemDraft.mailHead.mailObjectId === mailObjId){

                systemDrafts.splice(draftId,1)
                newSystemDrafts = systemDrafts

              }

              draftId+=1
            })

            this.appStorage.set('drafts',newSystemDrafts)
            this.mailService.systemDrafts = newSystemDrafts
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

      this.mailService.mailFlags.forEach((mailFlag: MailFlag) =>{

        if (mailFlag.flagName === flagName){

          archiveMailForm.append('mailFlagId',JSON.stringify(mailFlag.flagId))

        }

      })

      archiveMailForm.append('MailObjId',JSON.stringify(mailObjId))

      this.appHttp.postHttp(archiveMailForm,'/mails/restoreFlag').then((resp: any) =>{

        if (this.mailService.chosenFlag.flagName === 'Draft'){

          this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{
            let newSystemDrafts:Array<Draft>=[]
            let draftId:number = 0;
            systemDrafts.forEach((systemDraft: Draft) =>{

              if (systemDraft.mailHead.mailObjectId === mailObjId){

                systemDrafts.splice(draftId,1)
                newSystemDrafts = systemDrafts

              }

              draftId+=1
            })

            this.appStorage.set('drafts',newSystemDrafts)
            this.mailService.systemDrafts = newSystemDrafts
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


  editMail(mailObjId: number):void{

    this.showLoader('Getting Your Draft').then((loader: HTMLIonLoadingElement) =>{

    this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

      systemDrafts.forEach((systemDraft: Draft) =>{

        if (systemDraft.mailHead.mailObjectId === mailObjId){

          const mailAttachments: Array<MailAttachment>=[]


          systemDraft.mailHead.mailAttachments.forEach((mailAtt: any) =>{

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

          const idbMailHead: MailHead={
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
            archived: systemDraft.mailHead.archived
          }

          this.mailService.mailBody.mailBodyPayload=systemDraft.mailBody.mailBodyParay.join('\n')

          this.mailService.mailHead=idbMailHead
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

        this.mailService.mailHeads=[]
        loader.dismiss()

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

}