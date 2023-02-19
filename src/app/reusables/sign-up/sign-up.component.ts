import { Component, OnInit , ElementRef} from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {

  private firstName='';
  private lastName='';
  private userMail='';
  private username='';
  private userPassword='';
  private userExists=true;

  public ionicForm!:FormGroup

  constructor(
    private userService: UserService,
    private eleRef: ElementRef,
    public formBuilder: FormBuilder,
    private appRouter: Router,
    private loadingController: LoadingController,
    private alertCtrl: AlertController,
    private appHttp: HttpService
  ) { }

  ngOnInit() {

    this.ionicForm = new FormGroup({
        firstName: new FormControl(),
        lastName: new FormControl(),
        userMail: new FormControl(),
        username: new FormControl(),
        userPassword: new FormControl(),
        confPassword: new FormControl()
    });
  }


  authenticate(): void{

    this.showLoader('Signing You Up').then((loaderEle: HTMLIonLoadingElement) =>{

      const signUpFormData = new FormData();

      signUpFormData.append('firstName',this.firstName);
      signUpFormData.append('lastName',this.lastName);
      signUpFormData.append('userEmail',this.userMail);
      signUpFormData.append('username',this.username);
      signUpFormData.append('password',this.userPassword);

      this.appHttp.postHttp(signUpFormData,'/orgProfile/signUp').then((signUpResp: any) =>{


        if(signUpResp.state === 2){

          this.userService.getMainUser().authState = signUpResp.state
          this.userService.getMainUser().autheticated=false
          this.userService.getMainUser().dateJoined = new Date(signUpResp.dateJoined)
          this.userService.getMainUser().lastLogin = new Date(signUpResp.lastLogin)
          this.userService.getMainUser().emailAddress = signUpResp.emailAddress
          this.userService.getMainUser().firstName = signUpResp.firstName
          this.userService.getMainUser().lastName = signUpResp.lastName
          this.userService.getMainUser().username = signUpResp.username

          loaderEle.dismiss()

          this.showAlert('Sign Up','Successfully signed up').then((htmlResp: HTMLIonAlertElement) =>{

            htmlResp.onDidDismiss().then(()=>{

              this.appRouter.navigateByUrl('/profile');

            });

          });

        }

      }).catch((err: any) =>{

        console.error(err);

        loaderEle.dismiss()

        this.showAlert('Sign Up','Error occured while signing you up, please try again.')
      })

    })

  }

  createUsername():void{

    let username:string = this.eleRef.nativeElement.querySelector('.username').value
    let firstName: string = this.eleRef.nativeElement.querySelector('.firstName').value
    let lastName: string = this.eleRef.nativeElement.querySelector('.lastName').value

    if (username !== ''){

      if (firstName !== ''){
        this.firstName=firstName
      }else{
        this.firstName=''
      }

      if (lastName!== ''){
        this.lastName=lastName
      }else{
        this.lastName=''
      }

      username = this.firstName+'_'+this.lastName;
      this.eleRef.nativeElement.querySelector('.username').value=username;
      this.username=username;

      if (this.firstName === ''&&this.lastName=== ''){
        this.eleRef.nativeElement.querySelector('.username').value='';
        this.username=''
      }

    }else{

      username = firstName+'_'+lastName
      this.eleRef.nativeElement.querySelector('.username').value=username
    }
  }

  checkUserExists(evt: any):void{

    const username: string = evt.target.value;

    this.userService.cechUserExists(username).then((exists: boolean) =>{

      const usernameItem: any = this.eleRef.nativeElement.querySelector('.usernameItem')

      if (exists){

        usernameItem.classList.add('ion-invalid');
        this.userExists=true;

      }else{
        this.userExists=false;
      }

    }).catch((err: any) =>{

      console.error(err);

    });

  }

  checkEmail(evt: any){

    const emailAddress:string = evt.target.value

    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    const emailItem = this.eleRef.nativeElement.querySelector('.userEmailItem')

    if (emailAddress.match(validRegex)===null){

      emailItem.classList.add('ion-invalid')

    }else{

      emailItem.classList.remove('ion-invalid')
      this.userMail=emailAddress

    }

  }

  confirmPassword(evt: any): void{

    const confPassItem: any = this.eleRef.nativeElement.querySelector('.confPassItem')
    const authButs: any = this.eleRef.nativeElement.querySelector('.authButs')
    const userPassword: string= this.eleRef.nativeElement.querySelector('.userPasscode').value
    const confirmPassword: string = evt.target.value

    if (confirmPassword ===''|| confirmPassword!==userPassword){

      confPassItem.classList.add('ion-invalid')
      authButs.disabled=true;

    }else{
      if (!this.userExists){
        this.userPassword=confirmPassword;
        authButs.disabled=false;
      };

    }

  }

  showLoader(message:string,profUrl?:string): Promise<HTMLIonLoadingElement>{

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
