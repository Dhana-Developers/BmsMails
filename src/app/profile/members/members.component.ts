import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Storage } from '@ionic/storage';

import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent implements OnInit {

  public mainMember: Member={
    memberId: '',
    memberDepartmentId: '',
    memberUserId: ''
  }

  constructor(
    private appRouter: Router,
    public userService: UserService,
    public organization:OrganizationService,
    public department: DepartmentsService,
    public member: MembersService,
    private eleRef: ElementRef,
    private appMails: MailsService,
    private appHttp: HttpService,
    private appStorage: Storage,
    private loadingController:LoadingController,
    private alertCtrl: AlertController

  ) { }

  ngOnInit() {

    if (this.userService.getMainUser().username===''){

      this.appRouter.navigateByUrl('auth/signIn')

    }

  }

  navigateTo(link: string):void{

    this.appRouter.navigateByUrl(link);
  }

  getMailHeads(flagId: number):void{

    const fetchMailHeadsForm: FormData = new FormData()
    fetchMailHeadsForm.append('flagId',JSON.stringify(flagId))
    fetchMailHeadsForm.append('objectMailAccount',this.appMails.mailAccount.hostLoginAddress)

    this.showLoader('Fetching Acccount Details').then((loadingCtr: HTMLIonLoadingElement) =>{


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

          this.appMails.unreadMails.push(fetchedMailHead)
          this.appMails.mailHeads.push(fetchedMailHead)

        })

        for (let mailFlag of this.appMails.mailFlags){

          if (mailFlag.flagId === flagId){

            this.appMails.chosenFlag=mailFlag

          }

        }
        this.appMails.mailAccount.disableMail = false;
        loadingCtr.dismiss()
        this.appRouter.navigateByUrl('mails/mailsList')


      }).catch((err: any) =>{

        loadingCtr.dismiss()
        console.error(err);

      })


    })

  }

  navigateToMailsList(mailAccount: string): void{

    const getFlagsForm: FormData = new FormData()

    getFlagsForm.append('accountId',this.member.getMainMember().memberId)

    this.appHttp.postHttp(getFlagsForm,'/mails/').then((systeMailFlags: any) =>{

      if (systeMailFlags.length !== 0){

        this.appStorage.get('drafts').then((systemDrafts: Array<Draft>) =>{

          this.appMails.systemDrafts = []

          systemDrafts.forEach((systemDraft: Draft) =>{

            if (systemDraft.mailHead.sender === this.appMails.mailAccount.hostLoginAddress){

              this.appMails.systemDrafts.push(systemDraft);

            }

          })

        })

        this.appMails.mailAccount.hostLoginAddress = mailAccount

        this.appMails.createMailFlags(systeMailFlags).then(()=>{

          this.getMailHeads(this.appMails.chosenFlag.flagId)

        })
      }else{
        this.showAlert('You don\'t have an account yet.')
      }

    })

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
