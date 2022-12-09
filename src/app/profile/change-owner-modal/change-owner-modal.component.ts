import { Component, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';

@Component({
  selector: 'app-change-owner-modal',
  templateUrl: './change-owner-modal.component.html',
  styleUrls: ['./change-owner-modal.component.scss'],
})
export class ChangeOwnerModalComponent implements OnInit {

  public changeButtonColor = 'primary'
  public disableBut: boolean=true

  public selectedUser:User={
    username: '',
    autheticated: false,
    firstName: '',
    lastName: '',
    emailAddress: '',
    authState: 0,
    memberShips: []
  }
  public searched_Users:Array<User>=[]
  private userIds: Array<string>=[]

  constructor(
    private modalCtrl: ModalController,
    private userOrg: OrganizationService,
    private appHttp: HttpService,
    private loadingController:LoadingController,
    private alertCtrl: AlertController
    ) { }

  ngOnInit() {}

  cancel(){

    return this.modalCtrl.dismiss(null, 'cancel');

  }

  getUsername(evt:any):void{

    const searchOrgMembersForm: FormData = new FormData()

    searchOrgMembersForm.append('username',evt.target.value)
    searchOrgMembersForm.append('organizationDomain', this.userOrg.getOrganization().orgDomain)

    this.appHttp.postHttp(searchOrgMembersForm,'/bmsBase/searchMembers').then((resp: Array<User>) =>{

      this.searched_Users=[]

      resp.forEach((orgUSer:User) =>{

        if (!this.userIds.includes(orgUSer.username)){

          this.searched_Users.push(orgUSer)

        }

      })

    })

  }

  selectNewOwner(username: any): void{

    this.searched_Users.forEach((searched_User: User) =>{

      if (searched_User.username === username){

        this.selectedUser={
          username: searched_User.username,
          autheticated: false,
          firstName: searched_User.firstName,
          lastName: searched_User.lastName,
          emailAddress: searched_User.emailAddress,
          authState: 0,
          memberShips: []
        }

        this.changeButtonColor='success'
        this.disableBut=false

      }

    })

  }

  chageOrgOwner():void{

    this.showLoader('Changing Organization Owner').then((loadingCtrl: HTMLIonLoadingElement) =>{


      const changeOwnerForm: FormData= new FormData()

      changeOwnerForm.append('username',this.selectedUser.username)
      changeOwnerForm.append('OrgDomain',this.userOrg.getOrganization().orgDomain)

      this.appHttp.postHttp(changeOwnerForm,'/bmsBase/changeOrgOwner').then((resp: any) =>{

        loadingCtrl.dismiss()
        this.showAlert('Owner Changed')

      }).catch((err: any) =>{
        loadingCtrl.dismiss()
        this.showAlert('Owner Change Failed')
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
        message: msg
      }).then((altctrl: HTMLIonAlertElement) =>{

        altctrl.present()

        resolve(altctrl)

      })

    })

  }

}
