import { Component, OnInit , ElementRef} from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from "@angular/forms";
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';
import  { PasswordValidators } from './validators'

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {

  public signUpForm:FormGroup = new FormGroup({
    userPassword: new FormControl(null,
    Validators.compose([
      Validators.required,
      Validators.minLength(8),
      PasswordValidators.patternValidator(new RegExp("(?=.*[0-9])"), {
        requiresDigit: true
      }),
      PasswordValidators.patternValidator(new RegExp("(?=.*[A-Z])"), {
        requiresUppercase: true
      }),
      PasswordValidators.patternValidator(new RegExp("(?=.*[a-z])"), {
        requiresLowercase: true
      }),
      PasswordValidators.patternValidator(new RegExp("(?=.*[$@^!%*?&])"), {
        requiresSpecialChars: true
      })
    ])),
    confPassword: new FormControl(null,Validators.compose([
      Validators.required,
      Validators.minLength(8)
    ])),
    username:new FormControl(null,[Validators.required])

  },
  {
    validators: [PasswordValidators.matchValidator,this.checkUserExists.bind(this)]
  }

  )

  public profileInfo: FormGroup = new FormGroup({
    firstName:new FormControl(null,[Validators.required]),
    lastName:new FormControl(null,[Validators.required]),
    userMail:new FormControl(null,[Validators.required])
  })

  public mailVerificationForm: FormGroup = new FormGroup({
    validationCode:new FormControl(
      null,
      Validators.compose([Validators.required,
        Validators.minLength(8),
        PasswordValidators.patternValidator(new RegExp("(?=.*[0-9])"), {
          requiresDigit: true
        }),
        PasswordValidators.patternValidator(new RegExp("(?=.*[A-Z])"), {
          requiresUppercase: true
        }),
        PasswordValidators.patternValidator(new RegExp("(?=.*[a-z])"), {
          requiresLowercase: true
        }),
        PasswordValidators.patternValidator(new RegExp("(?=.*[$@^!%*?&])"), {
          requiresSpecialChars: true
        })
      ])),
  })

  constructor(
    private userService: UserService,
    public formBuilder: FormBuilder,
    private appRouter: Router,
    private loadingController: LoadingController,
    private alertCtrl: AlertController,
    private appHttp: HttpService
  ) { }

  ngOnInit() {

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
  get errormailVerificationFormControl() {
    return this.mailVerificationForm.controls;
  }


  checkUserExists(control: AbstractControl):any{

    const usernameContol: any = control.get("username")

    const username: string = usernameContol.value

    if (!username?.length) {
      return null;
    }

    this.userService.cechUserExists(username).then((exists: boolean) =>{

      if (exists){

        usernameContol.setErrors({ uniqueRequired: true })
        return null

      }else{

        return null

      }

    }).catch((err: any) =>{
      usernameContol.setErrors({ uniqueRequired: true })
      console.error(err);

    });

  }

  createUser():void{

    const newUser: AppUser = {
      username: this.signUpForm.value.username,
      firstName: '',
      lastName: '',
      emailAddress: ''
    }

    this.userService.createUser(newUser,this.signUpForm.value.userPassword,'/orgProfile/signUp').subscribe(
      (userCreated: boolean)=>{

      console.log(userCreated);

    })
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
