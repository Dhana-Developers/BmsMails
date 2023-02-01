import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { AppService } from 'src/app/app.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { stringify } from 'querystring';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {

  public generatedCode: string = ''
  private generatedCodeId: number=0

  constructor(
    public users: UserService,
    private appRouter: Router,
    private appService: AppService,
    private appHttp: HttpService,
    private loadingController: LoadingController,
    private alertCtrl: AlertController,
    public mailService: MailsService,
    public department: DepartmentsService,
    public members: MembersService,
    private eleRef: ElementRef
  ) { }

  ngOnInit() {

    if (this.users.getMainUser().username === ''){

      this.appRouter.navigateByUrl('auth/signIn')

    }

  }

  setMemberDetails(memberId: string){

    this.users.setMembership(memberId)

    const mailAccountsForm = this.eleRef.nativeElement.querySelector('.mailAccountsForm')
    mailAccountsForm.classList.remove('nosite')

  }

  generateCode(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  generatePasswordReseteCode(){

    const rawgeneratedCode: string=this.generateCode(6);

    const setCodeForm: FormData = new FormData()

    setCodeForm.append('username',this.users.getMainUser().username)
    setCodeForm.append('code',rawgeneratedCode)

    this.showLoader('Generating Code').then((loaderEle: HTMLIonLoadingElement) =>{


      this.appHttp.postHttp(setCodeForm,'/orgProfile/generateCode').then((resetCode: any) =>{

        loaderEle.dismiss()

        if (resetCode.status === 1){

          this.generatedCodeId = resetCode.id
          this.generatedCode = rawgeneratedCode

          this.showAlert('Password Reset','Code genrated').then(()=>{

            const emailParas: Array<string> = [
              'You are trying to reset your password.',
              'This is the code to use for password reset.',
              this.generatedCode,
              'Fill it in te generated code input box.',
              'If this is not you just ignore the email'
            ]
            this.composeMail(emailParas)
          })

        }else{
          this.showAlert('Password Reset','Code generation failed')
        }

      }).catch((err: any) =>{

        loaderEle.dismiss()

        this.showAlert('Password Reset','Error Occured please try again.')

        console.error(err);

      })

    })

  }


  composeMail(paras: Array<string>):void{

    const composeMailForm: FormData = new FormData()

    this.showLoader('Composing Mail').then((mailLoader: HTMLIonLoadingElement) =>{

      let flagId = 0;
      this.mailService.mailFlags.forEach((mailFlag: MailFlag) =>{

        if (mailFlag.flagName === 'Sent'){

          flagId = mailFlag.flagId

        }

      })

      composeMailForm.append('address',this.mailService.mailAccount.hostLoginAddress)
      composeMailForm.append('mailFlagId',JSON.stringify(flagId))
      composeMailForm.append('accountType',this.mailService.mailAccount.accountType)
      composeMailForm.append('profileLink',this.members.getMainMember().memberId)
      composeMailForm.append('subdomain',this.department.getDepartment().departmentID)

      this.appHttp.postHttp(composeMailForm,'/mails/getMailObject').then((mailObjectResp:any) =>{

        this.mailService.mailObject={
          userAccount: this.mailService.mailAccount.hostLoginAddress,
          mailFlag: String(flagId),
          mailObjectId: mailObjectResp.mail_object_id
        }

        this.mailService.mailSection='Writer'
        this.sendMail(paras)

        mailLoader.dismiss()

      }).catch((err: any) =>{

        mailLoader.dismiss()

        console.error(err);

      })

    })

  }


  sendMail(paras:Array<string>):void{
    let flagId = 0;
    this.mailService.mailFlags.forEach((mailFlag: MailFlag) =>{

      if (mailFlag.flagName === 'Sent'){

        flagId = mailFlag.flagId

      }

    })

    const sendMailForm: FormData = new FormData()

    sendMailForm.append('address',this.mailService.mailAccount.hostLoginAddress)
    sendMailForm.append('subdomain',this.department.getDepartment().departmentID)
    sendMailForm.append('profileLink',this.members.getMainMember().memberId)
    sendMailForm.append('accountType',this.mailService.mailAccount.accountType)
    sendMailForm.append('paras',JSON.stringify(paras))
    sendMailForm.append('attachments',JSON.stringify([]))
    sendMailForm.append('receivers',JSON.stringify([this.users.getMainUser().emailAddress]))
    sendMailForm.append('subject','Account Password Reset')
    sendMailForm.append('cc',JSON.stringify([]))
    sendMailForm.append('bcc',JSON.stringify([]))
    sendMailForm.append('objId',JSON.stringify(this.mailService.mailObject.mailObjectId))
    sendMailForm.append('mailFlagId',JSON.stringify(flagId))
    sendMailForm.append('mailFooterPresent',JSON.stringify(false))

      this.showLoader('Sending your mail').then((loaderCtrl: any) =>{


        this.appHttp.postHttp(sendMailForm,'/mails/sendMail').then((resp: any) =>{
          loaderCtrl.dismiss()

          if (resp.msgSent=== true){

            loaderCtrl.dismiss()
            this.showAlert('Password Reset','Mail Sent').then(()=>{
              const confirCodeForm = this.eleRef.nativeElement.querySelector('.confirCodeForm')
              confirCodeForm.classList.remove('nosite')
            })

          }

        }).catch((err: any) =>{
          loaderCtrl.dismiss()
          this.showAlert('Password Reset','Mail Not Sent')

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

  showAlert(alertTitle:string, alertMsg: string): Promise<HTMLIonAlertElement>{

    return new Promise<HTMLIonAlertElement>((resolve, reject) => {

      this.alertCtrl.create({
        header:alertTitle,
        message: alertMsg,
        buttons:[

          {
            text:'Ok',
            role:'Cancel'
          }

        ]
      }).then((alertEle: HTMLIonAlertElement) =>{

        alertEle.present()

        resolve(alertEle)

      })

    })

  }

  setMailAccount(address: string, accountType: string){

    const getMailLabelForm: FormData = new FormData()

    getMailLabelForm.append('accountType',accountType)
    getMailLabelForm.append('profileLink',this.members.getMainMember().memberId)
    getMailLabelForm.append('subdomain',this.department.getDepartment().departmentID)
    getMailLabelForm.append('address',address)

    this.showLoader('Getting account details').then((loaderEle: HTMLIonLoadingElement) =>{


      this.appHttp.postHttp(getMailLabelForm,'/mails/getMailLabels').then((systeMailFlags: any) =>{

        loaderEle.dismiss()

        if (systeMailFlags.status !== 0){

          this.mailService.mailAccount.hostLoginAddress = address
          this.mailService.mailAccount.accountType = accountType

          this.mailService.createMailFlags(systeMailFlags.mailLabels).then(()=>{

            const genCodeBut = this.eleRef.nativeElement.querySelector('.genCodeBut')
            genCodeBut.classList.remove('nosite')

          })
        }else{
          this.showAlert('Password Reset','You don\'t have an account yet.')
        }

      }).catch((err: any) =>{

        loaderEle.dismiss()
        this.showAlert('Password Reset','Error occured.')
        console.error(err);

      })

    })
  }

  confirmCode(){

    const sentCode = this.eleRef.nativeElement.querySelector('.sentCode').value;

    const sentCodeForm: FormData = new FormData()

    sentCodeForm.append('id',JSON.stringify(this.generatedCodeId))
    sentCodeForm.append('code',sentCode)

    this.showLoader('Cofirming code').then((loadingEle: HTMLIonLoadingElement) =>{

      this.appHttp.postHttp(sentCodeForm,'/orgProfile/confirmCode').then((confirmResp: any) =>{

        loadingEle.dismiss()

        if (confirmResp.status === 1){

          this.showAlert('Password Reset','Code confirm and is a match.')
          const changePasswordForm = this.eleRef.nativeElement.querySelector('.changePasswordForm')
          changePasswordForm.classList.remove('nosite')

        }else{

          this.showAlert('Password Reset','You\'ve sent the wrong code.')
        }

      }).catch((err: any) =>{

        loadingEle.dismiss()

        this.showAlert('Password Reset','Error occured please try again.')

      })

    })


  }

  changePassword(){

    const newPassword: string = this.eleRef.nativeElement.querySelector('.newPassword').value;
    const passwordConfirmation: string = this.eleRef.nativeElement.querySelector('.passwordConfirmation').value;

    if (newPassword!='' && passwordConfirmation!== ''){

      if (newPassword === passwordConfirmation){

        const changePasswordForm: FormData = new FormData()

        changePasswordForm.append('username',this.users.getMainUser().username)
        changePasswordForm.append('password', newPassword)

        this.showLoader('Changing password').then((loadingEle: HTMLIonLoadingElement) =>{

          this.appHttp.postHttp(changePasswordForm,'/orgProfile/changePassword').then((changePassResp: any) =>{

            loadingEle.dismiss()

            if (changePassResp.status === 1){

              this.showAlert('Password Reset','Your password is successfully changed').then(() =>{

                this.appRouter.navigateByUrl('auth/signIn')

              })

            }else{

              this.showAlert('Password Reset','Password change failed.')

            }

          }).catch((err: any) =>{

            loadingEle.dismiss()

            this.showAlert('Password Reset','Error occured, please try again.')
            console.error(err);

          })

        })

      }else{

        this.showAlert('Password Reset','Your passwords don\'t match.')

      }

      }else{

        this.showAlert('Password Reset','Please fill all required field.')

      }

  }



}
