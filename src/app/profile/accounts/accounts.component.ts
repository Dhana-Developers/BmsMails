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

  setMemberDetails(memberId: string, orgDomain:string): void{

    for (const memberShip of this.appUsers.getMainUser().memberShips) {

      if (memberShip.memberId === memberId && memberShip.organizationId == orgDomain){

        let deptMailAccount: string ='';

        const organizationDepts: Array<Department>=[]

        memberShip.organizationDepartments.forEach((orgDept: Department) =>{

          if (orgDept.departmentOrganization === orgDomain){

            deptMailAccount =orgDept.mailAccount
            organizationDepts.push(orgDept)

          }

        })

        const departmentMembers:any = memberShip.departmentMembers

        this.appUsers.getMainUser().disableNav = false

        const organizationDetails: Organization = {
          orgDomain: memberShip.organizationId,
          orgName: memberShip.organizationName,
          orgMailServer: memberShip.organizationMail,
          state: this.appUsers.getMainUser().authState,
          orgCreator: memberShip.organizationCreator
        }
        const departmentDetails: Department={
          departmentID: memberShip.departmentId,
          departmentName: memberShip.departmentName,
          departmentOrganization: memberShip.organizationId,
          state: this.appUsers.getMainUser().authState,
          departmentMembers: departmentMembers,
          mailAccount: deptMailAccount
        }
        const memberDetails: Member = {
          memberId: memberShip.memberId,
          memberDepartmentId: memberShip.departmentId,
          memberUserId: this.appUsers.getMainUser().username
        }

        this.sysOrganaization.setMainOrganization(organizationDetails)
        this.sysDepartments.setDepartment(departmentDetails)
        this.sysMembers.setMainMember(memberDetails)
        this.sysOrganaization.orgDepartments = organizationDepts

        this.appRouter.navigateByUrl('profile/members')

      }

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
      this.appHttp.postHttp(searchOrgForm,'/bmsBase/searchOrgs').then((resp: any) =>{

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

}
