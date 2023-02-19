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

  get errorControl() {
    return this.signUpForm.controls;
  }
  get errorProfileFormControl() {
    return this.profileInfo.controls;
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
