import { Component, OnInit, ElementRef } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { UserService } from 'src/app/base-services/user/user.service';

@Component({
  selector: 'app-request-membership-modal',
  templateUrl: './request-membership-modal.component.html',
  styleUrls: ['./request-membership-modal.component.scss'],
})
export class RequestMembershipModalComponent implements OnInit {

  private mainMember: Member={
    memberId: '',
    memberDepartmentId: '',
    memberUserId: ''
  }

  constructor(
    private mdlCtrl: ModalController,
    private eleRef: ElementRef,
    private loadingController: LoadingController,
    private alertCtrl: AlertController,
    public appDepartment: DepartmentsService,
    public appMember: MembersService,
    public appUser: UserService
  ) { }

  ngOnInit() {}

  cancel(){

    return this.mdlCtrl.dismiss()

  }



  addMember():void{

    this.showLoader('Sending Request').then((loaderEle: HTMLIonLoadingElement) =>{

      const usernameField:string = this.eleRef.nativeElement.querySelector('.usernameField').value

      this.mainMember.memberDepartmentId=this.appDepartment.getDepartment().departmentID
      this.mainMember.memberUserId = usernameField
      this.mainMember.memberId = ''

      this.appMember.editMember(this.mainMember).then((editedMember: any) =>{

        loaderEle.dismiss()
        this.showAlert('Request Sent')

      }).catch((err: any) =>{

        loaderEle.dismiss()
        this.showAlert('Request Failed')

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

}
