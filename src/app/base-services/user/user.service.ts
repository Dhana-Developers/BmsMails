import { Injectable } from '@angular/core';

import { AppService } from 'src/app/app.service';
import { HttpService } from '../comms/http/http.service';
import { MembersService } from '../members/members.service';
import { DepartmentsService } from '../departments/departments.service';
import { OrganizationService } from '../organization/organization.service';
import { MailsService } from '../mails/mails.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private mainUser: User = {
    username: '',
    autheticated: false,
    firstName: '',
    lastName: '',
    emailAddress: '',
    dateJoined: undefined,
    lastLogin: undefined,
    authState:0,
    memberShips: [],
    disableNav: true
  }

  constructor(
    private appService: AppService,
    private appHttp: HttpService,
    private appMember: MembersService,
    private appDept: DepartmentsService,
    private appOrg: OrganizationService,
    private appMails: MailsService
  ) { }

  getMainUser(): User{
    return this.mainUser
  }

  cechUserExists(username: string): Promise<boolean>{

    return new Promise<boolean>((resolve, reject) => {

      const checkUserExistsForm: FormData = new FormData()

      checkUserExistsForm.append('username',username)

      this.appHttp.postHttp(checkUserExistsForm,'/orgProfile/checkUserExists').then((resp: any)=>{

        resolve(resp.exists);

      }).catch((err: any) =>{
        reject(err)
      })

    })
  }

  setMemberShips(memberShipsProfiles: Array<string>){
    memberShipsProfiles.forEach((memberShipsProfile) =>{

      this.mainUser.memberShips.push(memberShipsProfile);

    })
  }

  setMainUser(userDetails:any,authorized?:boolean){

    if (authorized === undefined){
      this.mainUser.autheticated = true;
    }else if (authorized === false){
      this.mainUser.autheticated = false;
    }

    this.mainUser.authState = userDetails.state;
    this.mainUser.dateJoined = new Date(userDetails.dateJoined);
    this.mainUser.lastLogin = new Date(userDetails.lastLogin);
    this.mainUser.username = userDetails.username;
    this.mainUser.emailAddress = userDetails.emailAddress;
    this.mainUser.firstName = userDetails.firstName;
    this.mainUser.lastName = userDetails.lastName;

  }

  enableNav(){

    this.mainUser.disableNav = false;

  }

  setMembership(memberShipId: string){

    const getMembershipForm: FormData = new FormData();

    getMembershipForm.append('profileLink',memberShipId);

    this.appHttp.postHttp(getMembershipForm,'/orgProfile/getMembership').then((membsershipDetails: any) =>{

      const memberDetails: Member = {
        memberId: membsershipDetails.profileLink,
        memberDepartmentId: membsershipDetails.subdomain,
        memberUserId: membsershipDetails.userId
      };

      const deptDetails: Department={
        departmentID: membsershipDetails.subdomain,
        departmentName: membsershipDetails.departmentName,
        departmentOrganization: membsershipDetails.domain,
        departmentMembers: membsershipDetails.departmentMembers,
        state: 0,
        mailAccount: '',
        recruiting: membsershipDetails.recruitment
      };

      const orgDetails: Organization={
        orgDomain: membsershipDetails.domain,
        orgName: membsershipDetails.organizationName,
        orgMailServer: '',
        orgCreator: membsershipDetails.organizationCreator,
        state: 0
      }

      this.appMember.setMainMember(memberDetails);
      this.appDept.setDepartment(deptDetails);
      this.appOrg.setMainOrganization(orgDetails);
      this.appOrg.orgMode = 'view'

      membsershipDetails.organizationDepartments.forEach((organizationDepartment: any) => {

        const orgDept: Department = {
          departmentID: organizationDepartment.subdomain,
          departmentName: organizationDepartment.name,
          departmentOrganization: organizationDepartment.domain,
          departmentMembers: organizationDepartment.departmentMembers,
          state: 0,
          mailAccount: '',
          recruiting: organizationDepartment.recruitment,
        }

        organizationDepartment.mailAccounts.forEach((mailAccount: any) => {

          const appMailAccount: MailAccount={
            hostLoginAddress: mailAccount.address,
            name: mailAccount.name,
            accountType: mailAccount.accountType
          }
          orgDept.departmentMailAccounts?.push(appMailAccount)

        });

        this.appOrg.orgDepartments.push(orgDept)

      });


      membsershipDetails.mailServers.forEach((mailServer: any) => {

        const appMailServer: MailServer={
          name: mailServer.name,
          address: mailServer.address,
          domain: orgDetails.orgDomain
        }

        this.appMails.mailServers.push(appMailServer)

      });

      membsershipDetails.mailAccount.forEach((mailAccount: any) => {

        const appMailAccount: MailAccount = {
          hostLoginAddress: mailAccount.address,
          name: mailAccount.name,
          accountType: mailAccount.accountType
        }

        this.appMember.mailAccounts.push(appMailAccount)

      });

      membsershipDetails.departmentMailAccounts.forEach((mailAccount: any) => {

        const appMailAccount: MailAccount={
          hostLoginAddress: mailAccount.address,
          name: mailAccount.name,
          accountType: mailAccount.accountType
        }
        this.appDept.mailAccounts.push(appMailAccount)

      });

      this.enableNav()



    }).catch((err: any) =>{

      console.error(err);

    });

  }

}
