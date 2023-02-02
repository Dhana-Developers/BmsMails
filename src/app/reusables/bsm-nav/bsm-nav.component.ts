import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-bsm-nav',
  templateUrl: './bsm-nav.component.html',
  styleUrls: ['./bsm-nav.component.scss'],
})
export class BsmNavComponent implements OnInit {

  constructor(
    private appRouter: Router,
    public appUsers: UserService,
    public sysDepartment: DepartmentsService,
    public sysOrganization: OrganizationService,
    public mailsService: MailsService,
    public appHttp: HttpService,
    private appStorage: Storage,
    public appMembers: MembersService,
    private loadingCtr: LoadingController
  ) { }

  ngOnInit() {

    this.appStorage.create()

  }

  navigateTo(link: string):void{

    this.appRouter.navigateByUrl(link);

  }

  getMailHeads(flagId: number):void{

    for (let mailFlag of this.mailsService.mailFlags){

      if (mailFlag.flagId === flagId){

        this.mailsService.chosenFlag=mailFlag

      }

    }
    this.showLoader('Fetching '+this.mailsService.chosenFlag.flagName+' Mails').then((loader: HTMLIonLoadingElement) =>{

      this.mailsService.mailHeads=[]

      if (this.mailsService.chosenFlag.flagName !== 'Draft'){


        const fetchMailHeadsForm: FormData = new FormData()
        fetchMailHeadsForm.append('flagId',JSON.stringify(flagId))
        fetchMailHeadsForm.append('accountType',this.mailsService.mailAccount.accountType)
        fetchMailHeadsForm.append('profileLink',this.appMembers.getMainMember().memberId)
        fetchMailHeadsForm.append('subdomain',this.sysDepartment.getDepartment().departmentID)
        fetchMailHeadsForm.append('address',this.mailsService.mailAccount.hostLoginAddress)

        this.appHttp.postHttp(fetchMailHeadsForm,'/mails/getMailHeads').then((resp: Array<any>) =>{

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

            this.mailsService.mailHeads.push(fetchedMailHead)

          })

          loader.dismiss()

          this.appRouter.navigateByUrl('mails/mailsList')


        }).catch((err: any) =>{

          loader.dismiss()

          console.error(err);

        })


      }else{
        this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

          if (systemDrafts!== null){

            systemDrafts.forEach((systemDraft: Draft) =>{

              if (systemDraft.mailHead.sender === this.mailsService.mailAccount.hostLoginAddress&&
                !systemDraft.mailHead.trashed&&!systemDraft.mailHead.spam&&!systemDraft.mailHead.archived){

                const mailHead: MailHead = this.mailsService.convertToMailhead(systemDraft.mailHead)

                this.mailsService.mailHeads.push(mailHead)


              }

            })

            loader.dismiss()

            this.appRouter.navigateByUrl('mails/mailsList')

          }else{

            loader.dismiss()

          }

        })

      }

      this.mailsService.mailSection='Reader'

    })

  }

  composeMail():void{

    const composeMailForm: FormData = new FormData()

    this.showLoader('Composing Mail').then((mailLoader: HTMLIonLoadingElement) =>{

      let flagId = 0;
      this.mailsService.mailFlags.forEach((mailFlag: MailFlag) =>{

        if (mailFlag.flagName === 'Draft'){

          flagId = mailFlag.flagId

        }

      })

      composeMailForm.append('address',this.mailsService.mailAccount.hostLoginAddress)
      composeMailForm.append('mailFlagId',JSON.stringify(flagId))
      composeMailForm.append('accountType',this.mailsService.mailAccount.accountType)
      composeMailForm.append('profileLink',this.appMembers.getMainMember().memberId)
      composeMailForm.append('subdomain',this.sysDepartment.getDepartment().departmentID)

      this.appHttp.postHttp(composeMailForm,'/mails/getMailObject').then((mailObjectResp:any) =>{

        this.mailsService.mailObject={
          userAccount: this.mailsService.mailAccount.hostLoginAddress,
          mailFlag: String(flagId),
          mailObjectId: mailObjectResp.mail_object_id
        }

        this.mailsService.mailHead={
          mailObjectId: mailObjectResp.mail_object_id,
          mailSubject: '',
          mailCc: [],
          mailBcc: [],
          mailReceipients: [],
          mailAttachments: [],
          sender: mailObjectResp.sender,
          reply_to: mailObjectResp.reply_to,
          creationTime: new Date(mailObjectResp.mailHeadTime),
          mailFlagId:flagId,
          spam: mailObjectResp.spam,
          trashed: mailObjectResp.trashed,
          archived: mailObjectResp.archived
        }

        this.mailsService.mailBody={

          mailBodyId: mailObjectResp.mailBodyId,
          mailBodyParay: [],
          mailObjectId: mailObjectResp.mail_object_id
        }

        this.mailsService.setDraft(true)

        this.mailsService.mailSection='Writer'

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

}
