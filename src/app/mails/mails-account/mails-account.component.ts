import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Storage } from '@ionic/storage';

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
    private appMails: MailsService,
    private appHttp: HttpService,
    private appStorage: Storage
  ) { }

  ngOnInit() {

    if (this.appUser.getMainUser().username == ''){

      this.appRouter.navigateByUrl('auth/signIn')

    }

  }

  navigateToMailsList(mailAccount: string): void{

    this.appHttp.getHttp('/mails/').then((systeMailFlags: any) =>{

      this.appStorage.get('drafts').then((systemDrafts: Array<Draft>) =>{

        this.appMails.systemDrafts = []

        systemDrafts.forEach((systemDraft: Draft) =>{

          this.appMails.systemDrafts.push(systemDraft);

        })

      })

      this.appMails.mailAccount.hostLoginAddress = mailAccount
      this.appMails.mailAccount.disableMail = false;

      this.appMails.createMailFlags(systeMailFlags).then(()=>{

        this.getMailHeads(this.appMails.chosenFlag.flagId)

      })

    })

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
          mailServerId:mailHeadResp.mailServerId,
          mailHeadId:mailHeadResp.mailHeadId
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

}
