import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Storage } from '@ionic/storage';

import { ModalController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';

import { MailsAccountComponent } from 'src/app/mails/mails-account/mails-account.component';

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
    private alertCtrl: AlertController,
    private mdlCtl: ModalController

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
    fetchMailHeadsForm.append('accountType',this.appMails.mailAccount.accountType)
    fetchMailHeadsForm.append('profileLink',this.member.getMainMember().memberId)
    fetchMailHeadsForm.append('subdomain',this.department.getDepartment().departmentID)
    fetchMailHeadsForm.append('address',this.appMails.mailAccount.hostLoginAddress)

    this.showLoader('Fetching Mails').then((loadingCtr: HTMLIonLoadingElement) =>{


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
            mailServerId: mailHeadResp.mailServerId,
            mailHeadId: mailHeadResp.mailHeadId,
            mailFlagId: mailHeadResp.mailLabel,
            spam: mailHeadResp.spam,
            trashed: mailHeadResp.trashed,
            archived: mailHeadResp.archived
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

  showAlert(msg: string, okCancel?: boolean): Promise<HTMLIonAlertElement>{

    let alertButtons: Array<any> = [

      {
        text:'OK',
        role:'cancel'
      }
    ]

    if (okCancel){
      alertButtons = [

        {
          text:'Cancel',
          role:'cancel'
        },

        {
          text:'OK',
          role:'continue'
        }
      ]
    }

    return new Promise<HTMLIonAlertElement>((resolve) => {

      this.alertCtrl.create({
        message: msg,
        buttons:alertButtons
      }).then((altctrl: HTMLIonAlertElement) =>{

        altctrl.present()

        resolve(altctrl)

      })

    })

  }

  createMailAccount(accountType: string, accountMode: string,hostLoginAddress?: string,edit?: boolean){

    this.appMails.mailAccount.accountType = accountType
    this.appMails.mailAccountOpType = accountMode
    this.appMails.mailAccountPassword = ''

    if (accountMode === 'edit' && hostLoginAddress!== undefined){

      this.showLoader('Getting account details').then((loaderEle: HTMLIonLoadingElement) =>{


        this.getMailAccountDetails(accountType,hostLoginAddress).then((gottenAccount: MailAccount) =>{

          loaderEle.dismiss()

          if (edit!== undefined){
            this.appMails.editingDisabled = !edit
          }

          this.appMails.mailAccount = gottenAccount

          this.mdlCtl.create({
            component: MailsAccountComponent
          }).then((createMailAccountComp: HTMLIonModalElement) =>{

            createMailAccountComp.present()

          })

        }).catch((err: any) =>{

          loaderEle.dismiss()
          this.showAlert('Error occured please try again.')

        })

      })

    }else{

      this.mdlCtl.create({
        component: MailsAccountComponent
      }).then((createMailAccountComp: HTMLIonModalElement) =>{

        createMailAccountComp.present()

      })

    }

  }

  removeMailAccount(accountId: number){

    this.showAlert('Are you sure you want to delete the account, the process is irrevasable.',
    true).then((alertEle: HTMLIonAlertElement) =>{

      alertEle.onDidDismiss().then((overlayData: any) =>{

        if (overlayData.role === 'continue'){

          const removeAccountForm: FormData = new FormData()

          removeAccountForm.append('id',JSON.stringify(accountId))

          this.showLoader('Removing mail account').then((loaderEle: HTMLIonLoadingElement) =>{

            this.appHttp.postHttp(removeAccountForm,'/mails/removeMailAccount').then(() =>{

              loaderEle.dismiss()
              this.showAlert('Account removed')

              let accountIndex: number = 0

              this.member.mailAccounts.forEach((mailAccount: MailAccount) =>{

                if (mailAccount.id === accountId){

                  this.member.mailAccounts.splice(accountIndex,1)

                }

                accountIndex+=1

              })

            }).catch((err: any) =>{
              loaderEle.dismiss()
              this.showAlert('Error occured, please try again.')
            })

          })

        }

      })

    })

  }

  getMailAccountDetails(accountType: string, hostLoginAddress: string): Promise<MailAccount>{

    return new Promise<MailAccount>((resolve, reject) => {

      const getMailAccountDetailsForm: FormData = new FormData()
      getMailAccountDetailsForm.append('accountType',accountType);
      getMailAccountDetailsForm.append('profileLink',this.member.getMainMember().memberId)
      getMailAccountDetailsForm.append('subdomain', this.department.getDepartment().departmentID)
      getMailAccountDetailsForm.append('address',hostLoginAddress)

      this.appHttp.postHttp(getMailAccountDetailsForm,'/mails/getMailAccount').then((resp: any) =>{

        const mailAccount: MailAccount = {
          id: resp.id,
          hostLoginAddress: resp.address,
          name: resp.name,
          accountType: resp.accountType
        }
        this.appMails.mailAccountPassword = resp.password

        resolve(mailAccount)

      }).catch((err: any) =>{

        reject(err)

      })

    })

  }

  getMailLebels(accountType:string, address: string){

    const getMailLabelForm: FormData = new FormData()

    getMailLabelForm.append('accountType',accountType)
    getMailLabelForm.append('profileLink',this.member.getMainMember().memberId)
    getMailLabelForm.append('subdomain',this.department.getDepartment().departmentID)
    getMailLabelForm.append('address',address)

    this.showLoader('Getting account details').then((loaderEle: HTMLIonLoadingElement) =>{


      this.appHttp.postHttp(getMailLabelForm,'/mails/getMailLabels').then((systeMailFlags: any) =>{

        loaderEle.dismiss()

        if (systeMailFlags.status !== 0){

          this.appMails.mailAccount.hostLoginAddress = address
          this.appMails.mailAccount.accountType = accountType

          this.appMails.createMailFlags(systeMailFlags.mailLabels).then(()=>{

            this.getMailHeads(this.appMails.chosenFlag.flagId)

          })
        }else{
          this.showAlert('Wrong account credentials.').then((alertEle: HTMLIonAlertElement) =>{

            alertEle.onDidDismiss()

          })
        }

      }).catch((err: any) =>{

        loaderEle.dismiss()
        this.showAlert('Error occured. Please Try again.')
        console.error(err);

      })

    })

  }

}
