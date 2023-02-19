import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';

import { HttpService } from 'src/app/base-services/comms/http/http.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';

import { ChangeOwnerModalComponent } from '../change-owner-modal/change-owner-modal.component';
import { MailsSeverComponent } from 'src/app/mails/mails-sever/mails-sever.component';

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
    private alertCtrl: AlertController,
    public mails: MailsService
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

    const createBut: any = this.eleRef.nativeElement.querySelector('.CreateOrgBut');

    if (evt.target.value !== ''){

      this.orgDetails.orgDomain=evt.target.value
      createBut.disabled=false;

    }else{

      this.orgDetails.orgDomain=''
      createBut.disabled=true;

    }

  }

  createOrg(): void{

    if (
      this.orgDetails.orgDomain!==''&&
      this.orgDetails.orgName!==''){

        this.showLoader('Creating Organizatio').then((orgLoader: HTMLIonLoadingElement) =>{


          this.orgService.editOrg(this.orgDetails,this.users.getMainUser()).then((eitOrResp: Organization)=>{

            orgLoader.dismiss();

            if (eitOrResp.state =1){

              this.showAlert('Created Organization successfully.').then((orgAlertEle: HTMLIonAlertElement) =>{

                orgAlertEle.onDidDismiss().then(() =>{

                  const departmentCreationForm: any = this.eleRef.nativeElement.querySelector('.departmentCreationForm');

                  departmentCreationForm.classList.remove('nosite');

                  const creatOrgForm: any = this.eleRef.nativeElement.querySelector('.creatOrgForm');
                  creatOrgForm.classList.add('nosite');

                })

              });

            }else{

              this.showAlert('Error creating organization.');

            }

          }).catch((err: any) =>{

            orgLoader.dismiss();
            this.showAlert('Error creating organization. Please try again');
            console.error(err);

          })

        });

      }

  }

  getDepartmentDetails(departmentId: string,departmentName:string):void{

    const getDepartmentDetailsForm: FormData= new FormData()

    getDepartmentDetailsForm.append('departmentId',departmentId)

    this.appHttp.postHttp(getDepartmentDetailsForm,'/orgProfile/getDepartmentDetails').then((resp: any) =>{

      const orgDept: Department={
        departmentID: resp.subdomain,
        departmentName: resp.name,
        departmentOrganization: this.orgService.getOrganization().orgDomain,
        departmentMembers: resp.departmentMembers,
        state: 0,
        mailAccount: '',
        recruiting: resp.recruitmentStatus
      }
      this.orgDept.mailAccounts=[]
      resp.departmentMails.forEach((departmentMail: any) => {
        const appMailAccount: MailAccount={
          id: departmentMail.id,
          hostLoginAddress: departmentMail.address,
          name: departmentMail.name,
          accountType: departmentMail.accountType
        }
        this.orgDept.mailAccounts.push(appMailAccount);
      });

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

        if (this.orgDept.mainDepartment.state ===1){

          loaderCtrl.dismiss()
          this.showAlert('Department Created').then((creatDeptAlert: HTMLIonAlertElement) =>{

            creatDeptAlert.onDidDismiss().then(() =>{

              this.appRouter.navigateByUrl('/profile/accounts')

            })

          })

        }else{

          this.showAlert('Department Creation Failed')

        }

      }).catch((err: any) =>{

        loaderCtrl.dismiss()

        this.showAlert('Department Creation Failed. Please Try again')

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

  mailServer(mode?:string){

    this.mdlCtr.create({
      component: MailsSeverComponent
    }).then((paymentMdl: HTMLIonModalElement) => {

      paymentMdl.present();

    });

  }

}
