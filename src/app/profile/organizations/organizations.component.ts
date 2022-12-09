import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';

import { HttpService } from 'src/app/base-services/comms/http/http.service';

import { ChangeOwnerModalComponent } from '../change-owner-modal/change-owner-modal.component';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
})
export class OrganizationsComponent implements OnInit {

  public mainUSer: User={
    username: '',
    autheticated: false,
    firstName: '',
    lastName: '',
    emailAddress: '',
    authState: 0,
    memberShips: []
  }
  public orgDetails: Organization={
    orgDomain: '',
    orgName: '',
    orgMailServer: '',
    state: 0,
    orgCreator: ''
  }

  constructor(
    public users:UserService,
    private appRouter: Router,
    public orgService: OrganizationService,
    public orgDept: DepartmentsService,
    private eleRef:ElementRef,
    private appHttp: HttpService,
    private mdlCtr: ModalController,
    private loadingController:LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {

    this.mainUSer = this.users.getMainUser();

    if (this.mainUSer.username === ''){

      this.appRouter.navigateByUrl('auth/signIn')

    }

  }

  checkOrgName(evt: any): void{

    if (evt.target.value !== ''){

      this.orgDetails.orgName=evt.target.value

    }else{

      this.orgDetails.orgName = ''

    }

  }

  checkOrgDomain(evt: any): void{

    if (evt.target.value !== ''){

      const organizationMailServer:any = this.eleRef.nativeElement.querySelector('.organizationMailServer')
      this.orgDetails.orgDomain=evt.target.value
      const mailServer: string = 'mail.'+evt.target.value

      organizationMailServer.value = mailServer;

    }else{

      this.orgDetails.orgDomain=''

    }

  }

  checkOrgMailServer(evt: any): void{

    if (evt.target.value!==''){

      this.orgDetails.orgMailServer=evt.target.value

      const createBut: any = this.eleRef.nativeElement.querySelector('.CreateBut');
      createBut.disabled=false;


    }else{

      this.orgDetails.orgMailServer=''

    }

  }

  createOrg(): void{

    if (
      this.orgDetails.orgDomain!==''&&
      this.orgDetails.orgMailServer!==''&&
      this.orgDetails.orgName!==''){

        this.orgService.editOrg(this.orgDetails,this.users.getMainUser()).then((eitOrResp: Organization)=>{

          if (eitOrResp.state >=1){

            this.appRouter.navigateByUrl('profile/departments')

          }

        }).catch((err: any) =>{

          console.error(err);

        })

      }

  }

  getDepartmentDetails(departmentId: string,departmentName:string):void{

    const getDepartmentDetailsForm: FormData= new FormData()

    getDepartmentDetailsForm.append('departmentId',departmentId)

    this.appHttp.postHttp(getDepartmentDetailsForm,'/bmsBase/getDepartmentDetails').then((resp: any) =>{

      const orgDept: Department={
        departmentID: departmentId,
        departmentName: departmentName,
        departmentOrganization: resp.organization,
        departmentMembers: resp.departmentMembers,
        state: 0,
        mailAccount: resp.departmentMail
      }

      this.orgDept.setDepartment(orgDept)
      this.appRouter.navigateByUrl('profile/departments')

    })

  }

  checkDepartmentName(evt: any): void{

    let departmentName: string = evt.target.value

    if (departmentName !==''){

      this.orgDept.mainDepartment.departmentName=departmentName;

      this.orgDept.mainDepartment.departmentID = departmentName.replace(
        ' ','').toLowerCase()+'.'+this.orgService.getOrganization().orgDomain
      this.orgDept.mainDepartment.departmentOrganization = this.orgService.getOrganization(
      ).orgMailServer

    }else{
      this.orgDept.mainDepartment.departmentID=''
    }

  }

  checkdepId(evt: any): void{

    const createBut = this.eleRef.nativeElement.querySelector('.CreateBut')

    if(evt.target.value !== ''){
      createBut.disabled = false

    }else{

      createBut.disabled = true

    }

  }

  createDepartment(): void{

    this.showLoader('Creating Department').then((loaderCtrl: HTMLIonLoadingElement) =>{


      this.orgDept.editDepartment(this.orgDept.mainDepartment,this.orgService.getOrganization()).then((resp: Department) =>{

        loaderCtrl.dismiss()

        this.orgDept.mainDepartment = resp

        if (this.orgDept.mainDepartment.state >=1){

          this.showAlert('Department Created')

        }else{

          this.showAlert('Department Creation Failed')

        }

      }).catch((err: any) =>{

        loaderCtrl.dismiss()

        this.showAlert('Department Creation Failed')

        console.error(err);

      })

    })

  }
  createChangeOwnerModal(): void{

    this.mdlCtr.create({
      component: ChangeOwnerModalComponent
    }).then((paymentMdl: HTMLIonModalElement) => {

      paymentMdl.present();

    });

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
