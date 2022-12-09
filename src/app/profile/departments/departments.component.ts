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
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {

    if (this.appUser.getMainUser().username ===''){

      this.appRouter.navigateByUrl('auth/signIn')

    }

  }

  checkDepartmentName(evt: any): void{

    let departmentName: string = evt.target.value

    if (departmentName !==''){

      this.appDepartment.mainDepartment.departmentName=departmentName;

      this.appDepartment.mainDepartment.departmentID = departmentName.replace(
        ' ','').toLowerCase()+'.'+this.appOrganization.getOrganization().orgDomain
      this.appDepartment.mainDepartment.departmentOrganization = this.appOrganization.getOrganization(
      ).orgMailServer

    }else{
      this.appDepartment.mainDepartment.departmentID=''
    }

  }

  checkdepId(evt: any): void{

    if(evt.target.value !== ''){

      const createBut = this.eleRef.nativeElement.querySelector('.CreateBut')
      createBut.disabled = false

    }

  }

  createDepartment(): void{

    this.showLoader('Creating Department').then((loaderCtrl: HTMLIonLoadingElement) =>{


      this.appDepartment.editDepartment(this.appDepartment.mainDepartment,this.appOrganization.getOrganization()).then((resp: Department) =>{

        this.appDepartment.mainDepartment = resp

        if (this.appDepartment.mainDepartment.state >=1){

          loaderCtrl.dismiss()
          this.showAlert('Department Created')

        }else{

          this.showAlert('Department Creation Failed')

        }

      }).catch((err: any) =>{

        this.showAlert('Department Creation Failed')

        console.error(err);

      })

    })

  }
  getMailHeads(flagId: number):void{

    const fetchMailHeadsForm: FormData = new FormData()
    fetchMailHeadsForm.append('flagId',JSON.stringify(flagId))
    fetchMailHeadsForm.append('objectMailAccount',this.appMails.mailAccount.hostLoginAddress)

    this.showLoader('Fecthing Mail Account Details').then((ionLoadr: HTMLIonLoadingElement) =>{


      this.appHttp.postHttp(fetchMailHeadsForm,'/mails/getMailHeads').then((resp: Array<any>) =>{

        ionLoadr.dismiss()

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
        this.appRouter.navigateByUrl('mails/mailsList')


      }).catch((err: any) =>{

        this.showAlert('Failed To Fetch Resoucers')

        console.error(err);

      })


    })

  }

  navigateToMailsList(mailAccount: string): void{

    const getFlagsForm: FormData = new FormData()


    getFlagsForm.append('accountId',this.appDepartment.getDepartment().mailAccount)

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

  changeMemberStatus(memberId:string, evt: any):void{

    const changeMemberStatusForm: FormData = new FormData()

    changeMemberStatusForm.append('memberId',memberId)
    changeMemberStatusForm.append('status',evt.target.value)

    this.showLoader('Changing User Status').then((changeUserLoader: HTMLIonLoadingElement) =>{

      this.appHttp.postHttp(changeMemberStatusForm,'/bmsBase/changeMemberStatus').then((resp: any) =>{

        changeUserLoader.dismiss()
        this.showAlert(memberId+' changed to '+evt.target.value)

      })

    })

  }
}
