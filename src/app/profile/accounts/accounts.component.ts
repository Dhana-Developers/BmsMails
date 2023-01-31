import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ModalController } from '@ionic/angular';

import { UserService } from 'src/app/base-services/user/user.service';
import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';

import { RequestMembershipModalComponent } from '../request-membership-modal/request-membership-modal.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {

  constructor(
    public appUsers: UserService,
    private appRouter: Router,
    public sysOrganaization: OrganizationService,
    public sysDepartments: DepartmentsService,
    private sysMembers: MembersService,
    private modalCtrl: ModalController,
    private appHttp: HttpService
  ) { }

  ngOnInit() {

    if (this.appUsers.getMainUser().username == ""){

      this.appRouter.navigateByUrl('auth/signIn')

    }

  }

  createRequestMebershipModal(deptId: string): void{

    let chosenDept: Department={
      departmentID: '',
      departmentName: '',
      departmentOrganization: '',
      departmentMembers: [],
      state: 0,
      mailAccount: ''
    }
    let chosenOrg: Organization={
      orgDomain: '',
      orgName: '',
      orgMailServer: '',
      orgCreator: '',
      state: 0
    }

    this.sysDepartments.searchedDepartments.forEach((searchedDept: Department) =>{

      if (searchedDept.departmentID === deptId){
        chosenDept=searchedDept
      }

    })
    chosenOrg=this.sysOrganaization.searchedOrgs[chosenDept.departmentOrganization]

    this.sysDepartments.setDepartment(chosenDept)
    this.sysOrganaization.setMainOrganization(chosenOrg)

    this.modalCtrl.create({
      component: RequestMembershipModalComponent
    }).then((requestMembershipModal: HTMLIonModalElement) =>{
      requestMembershipModal.present()
    })

  }

  searchOrgs(evt: any): void{

    this.sysDepartments.searchedDepartments=[]
    this.sysOrganaization.searchedOrgs={}

    const searchOrgForm: FormData = new FormData()

    if (evt.target.value !== ''){

      searchOrgForm.append('searchTerm',evt.target.value)
      this.appHttp.postHttp(searchOrgForm,'/orgProfile/searchOrgs').then((resp: any) =>{

        resp.forEach((orgeptDetails: any) => {

          const orgDept: Department={
            departmentID: orgeptDetails.departmentId,
            departmentName: orgeptDetails.departmentName,
            departmentOrganization: orgeptDetails.orgDomain,
            departmentMembers: [],
            state: 0,
            mailAccount: ''
          }

          const searchedOrg: Organization={
            orgDomain: orgeptDetails.orgDomain,
            orgName: orgeptDetails.orgName,
            orgMailServer: '',
            orgCreator: '',
            state: 0
          }

          this.sysOrganaization.searchedOrgs[orgeptDetails.orgDomain]=searchedOrg
          this.sysDepartments.searchedDepartments.push(orgDept)

        });

      })

    }

  }

  setMembership(membershipId: string){

    this.appUsers.setMembership(membershipId)
    this.appRouter.navigateByUrl('/profile/members')

  }

  navigateTo(url: string){

    this.appRouter.navigateByUrl(url)

  }

}
