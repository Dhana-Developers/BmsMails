import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {

  private username = '';
  private password = '';

  constructor(
    private eleRef: ElementRef,
    private userService: UserService,
    private appRouter: Router,
    private loadingController: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {}


  checkUSerNameFilled(evt: any): void{

    const username: string = this.eleRef.nativeElement.querySelector('.username').value;
    const authButs: any = this.eleRef.nativeElement.querySelector('.authButs')
    const userPassowrd: string= evt.target.value;

    const username_pair: Array<string> = username.split('_')

    if (username != ''|| userPassowrd!= ''){

      this.username = username;
      this.password = userPassowrd;

      authButs.disabled = false;

    }else{

      this.username = username;
      this.password = userPassowrd;

      authButs.disabled = false;
    }

  }


  signIn(): void{

    if (this.username!== ''&& this.password!==''){

      const userAuth: AuthDetails={
        username: this.username,
        password: this.password
      };

      this.showLoader('Authenticating').then((loaderEle: HTMLIonLoadingElement) =>{


        this.userService.authenticate(userAuth).then((sysMainUser: User)=>{

          if (sysMainUser.autheticated){

            this.appRouter.navigateByUrl('profile')

          }else{

            this.showAlert('Sign In','Authentication Failed')

          }

          loaderEle.dismiss()

        }).catch((err: any) =>{

          loaderEle.dismiss()

          this.showAlert('Sign In','Authentication failed. Check your network and try again')

        })

      })

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

}
