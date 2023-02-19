import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Storage } from '@ionic/storage';

import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';

import { MailsAccountComponent } from 'src/app/mails/mails-account/mails-account.component';
@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit {

  public mainMember: Member={
    memberId: '',
    memberDepartmentId: '',
    memberUserId: ''
  }

  constructor(
    public appUser:UserService,
    public appOrganization:OrganizationService,
    private appRouter: Router,
    public appDepartment: DepartmentsService,
    private eleRef: ElementRef,
    private appMails: MailsService,
    private appHttp: HttpService,
    private appStorage: Storage,
    private appMember: MembersService,
    private loadingController:LoadingController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private mdlCtl: ModalController
  ) { }

  ngOnInit() {

    if (this.appUser.getMainUser().username ===''){

      this.appRouter.navigateByUrl('auth/signIn')

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

  changeMemberStatus(memberId:string, actionType: string):void{

    const changeMemberStatusForm: FormData = new FormData()

    changeMemberStatusForm.append('memberId',memberId)
    changeMemberStatusForm.append('status',actionType)

    this.showLoader('Changing User Status').then((changeUserLoader: HTMLIonLoadingElement) =>{

      this.appHttp.postHttp(changeMemberStatusForm,'/orgProfile/changeMemberStatus').then((resp: any) =>{

        changeUserLoader.dismiss()
        if (actionType === 'Activate'){
          this.showAlert(memberId+' is '+actionType+'d')
        }else{

        this.showAlert(memberId+' is '+'Deactivated')
        }

      }).catch((err: any) =>{
        changeUserLoader.dismiss()
        console.error(err);

      })

    })

  }

  createChangeUserStatusActionSheet(memberId: string){

    this.actionSheetCtrl.create({

      header: 'Change Member Status',
      buttons: [
        {
          text: 'Activate',
          data: {
            action: 'Activate',
          },
        },
        {
          text: 'Deactivate',
          data: {
            action: 'Pending',
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    }).then((ionActionsheet: HTMLIonActionSheetElement) =>{

      ionActionsheet.present().then(()=>{

        ionActionsheet.onDidDismiss().then((eventDetails: any) =>{

          if (eventDetails.role !== 'cancel'&& eventDetails.role !== 'backdrop'){

            const chosenAction: string = eventDetails.data.action;

            this.changeMemberStatus(memberId,chosenAction)

          }

        });

      })

    });

  }

  departmentRecruitment(subdomain: string, evt: any){

    const recruitmentStatus: boolean=!evt.target.checked

    const recruitmentForm: FormData = new FormData();

    recruitmentForm.append('subdomain',subdomain);
    recruitmentForm.append('recruiting',JSON.stringify(recruitmentStatus))

    this.showLoader('Changing recruitment status').then((ionLoaderEle: HTMLIonLoadingElement) =>{

      this.appHttp.postHttp(recruitmentForm,'/orgProfile/departmentRecruiting').then((resp: any) =>{

        ionLoaderEle.dismiss();

        this.showAlert(`Recruitment status changed to ${recruitmentStatus}`);

      }).catch((err: any) =>{

        ionLoaderEle.dismiss();
        this.showAlert('Recruitment status change failed.');
        console.error(err);

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
          }else{
            this.appMails.editingDisabled = false
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

              this.appDepartment.mailAccounts.forEach((mailAccount: MailAccount) =>{

                if (mailAccount.id === accountId){

                  this.appDepartment.mailAccounts.splice(accountIndex,1)

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
      getMailAccountDetailsForm.append('profileLink',this.appMember.getMainMember().memberId)
      getMailAccountDetailsForm.append('subdomain', this.appDepartment.getDepartment().departmentID)
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

  getMailHeads(flagId: number):void{

    const fetchMailHeadsForm: FormData = new FormData()
    fetchMailHeadsForm.append('flagId',JSON.stringify(flagId))
    fetchMailHeadsForm.append('accountType',this.appMails.mailAccount.accountType)
    fetchMailHeadsForm.append('profileLink',this.appMember.getMainMember().memberId)
    fetchMailHeadsForm.append('subdomain',this.appDepartment.getDepartment().departmentID)
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

  getMailLebels(accountType:string, address: string){

    const getMailLabelForm: FormData = new FormData()

    getMailLabelForm.append('accountType',accountType)
    getMailLabelForm.append('profileLink',this.appMember.getMainMember().memberId)
    getMailLabelForm.append('subdomain',this.appDepartment.getDepartment().departmentID)
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
          this.showAlert('Wrong account credentials.')
        }

      }).catch((err: any) =>{

        loaderEle.dismiss()
        this.showAlert('Error occured.')
        console.error(err);

      })
    })

  }

}
