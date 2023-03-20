import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';
import { HttpClient } from '@angular/common/http';

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
    private alertCtrl: AlertController,
    private appHttp: HttpService,
    private http: HttpClient
  ) { }

  ngOnInit() {}


  checkUSerNameFilled(): void{

    const username: string = this.eleRef.nativeElement.querySelector('.username').value;
    const authButs: any = this.eleRef.nativeElement.querySelector('.authButs')
    const userPassowrd: string= this.eleRef.nativeElement.querySelector('.userPasscode').value;

    const username_pair: Array<string> = username.split('_')

    if (username != '' && userPassowrd!= ''){

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

      this.showLoader('Signing In').then((loaderEle: HTMLIonLoadingElement) =>{

        const signInForm = new FormData();
        signInForm.append('username',this.username);
        signInForm.append('password',this.password);

        this.http.post('https://bms.vincowoods.com/orgProfile/signIn', signInForm).subscribe((authResp: any) =>{

          loaderEle.dismiss();

          if(authResp.state !== 0 && authResp.state !== 5){

            this.userService.setMainUser(authResp)

            if (authResp.state===4){

              this.userService.setMemberShips(authResp.memberShips)

            }

            this.showAlert('Sign In','Successfully signed in.').then((alertEle: HTMLIonAlertElement) =>{

              alertEle.onDidDismiss().then(()=>{

                this.appRouter.navigateByUrl('/profile/accounts')

              });

            });

          }else{

            if (authResp.state === 5){

              this.userService.setMainUser(authResp,false)

              this.userService.setMemberShips(authResp.memberShips)

              const forgotPassLabel: any = this.eleRef.nativeElement.querySelector('.forgotPassLabel');

              forgotPassLabel.classList.remove('nosite');

            }

            this.showAlert('Sign In','Wrong credentials.')
          }

        }),
        ((error: any) =>{
          loaderEle.dismiss();
          this.showAlert('Sign In','Connection problem, please try again.')
          console.error(error);

        })

      })

    }else{

      this.showAlert('Sign In', 'Please fill all the fields');

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

  resetPassword(){

    this.appRouter.navigateByUrl('profile/resetPassword')

  }

}
