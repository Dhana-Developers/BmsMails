import { Component, OnInit , ElementRef} from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';

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

  public ionicForm!:FormGroup

  constructor(
    private userService: UserService,
    private eleRef: ElementRef,
    public formBuilder: FormBuilder,
    private appRouter: Router,
    private loadingController: LoadingController,
    private alertCtrl: AlertController
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

    const userAuth: AuthDetails={
      username: this.username,
      password: this.userPassword,
      emailAddress:this.userMail,
      firstName: this.firstName,
      lastName: this.lastName
    }

    this.showLoader('Signing You Up').then((loaderEle: HTMLIonLoadingElement) =>{


      this.userService.authenticate(userAuth).then((resp: User)=>{

        if (resp.authState === 2){

          loaderEle.dismiss()
          this.appRouter.navigateByUrl('profile')

        }else{

          this.showAlert('Sign Up','Sign Up Failed')

        }

      }).catch((err: any) =>{

        loaderEle.dismiss()

        this.showAlert('Sign Up','Sign up failed. Check your network and try again')

        console.error(err);

      });


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

        usernameItem.classList.add('ion-invalid')

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

      this.userPassword=confirmPassword;
      authButs.disabled=false;

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
