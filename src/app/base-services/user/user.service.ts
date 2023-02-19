import { Injectable } from '@angular/core';


import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from  '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { catchError, Observable, retry, throwError } from 'rxjs';

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

  private appUser: AppUser = {
    username: '',
    firstName: '',
    lastName: '',
    emailAddress: ''
  }

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
    private appMails: MailsService,
    private appHttp$: HttpClient
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

  setMembership(memberShipId: string,dissableNav?:boolean){

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
          recruiting: organizationDepartment.recruitment
        }

        organizationDepartment.mailAccounts.forEach((mailAccount: any) => {

          const appMailAccount: MailAccount={
            id: mailAccount.id,
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
          id: mailAccount.id,
          hostLoginAddress: mailAccount.address,
          name: mailAccount.name,
          accountType: mailAccount.accountType
        }

        this.appMember.mailAccounts.push(appMailAccount)

      });

      membsershipDetails.departmentMailAccounts.forEach((mailAccount: any) => {

        const appMailAccount: MailAccount={
          id: mailAccount.id,
          hostLoginAddress: mailAccount.address,
          name: mailAccount.name,
          accountType: mailAccount.accountType
        }
        this.appDept.mailAccounts.push(appMailAccount)

      });

      if (dissableNav!== undefined){
        if (dissableNav !==true){
          this.enableNav()
        }
      }else{
        this.enableNav()
      }



    }).catch((err: any) =>{

      console.error(err);

    });

  }



  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  createUser(userToCreate: AppUser,password: string,endUrl:string,headers?:HttpHeaders): Observable<boolean>{

    const resourceLink: string = this.appHttp.getBaseLink()+endUrl;


    const createUserForm: FormData = new FormData()
    createUserForm.append('username',userToCreate.username)
    createUserForm.append('password',password)


    if( headers !== undefined){
      return this.appHttp$.post<boolean>(resourceLink,createUserForm,{headers,observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }else{
      return this.appHttp$.post<boolean>(resourceLink,createUserForm,{observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }

  }

  getUser(username: string, endUrl: string, headers?: HttpHeaders): Observable<User>{

    const resourceLink: string = this.appHttp.getBaseLink()+endUrl;

    const getUserForm: FormData = new FormData()
    getUserForm.append('username',username)

    if( headers !== undefined){
      return this.appHttp$.post<User>(resourceLink,getUserForm,{headers,observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }else{
      return this.appHttp$.post<User>(resourceLink,getUserForm,{observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }

  }

  updateUser(userToUpdate: AppUser, endUrl: string, headers?: HttpHeaders): Observable<boolean>{

    const resourceLink: string = this.appHttp.getBaseLink()+endUrl;

    const updateUserForm: FormData = new FormData()
    updateUserForm.append('username',userToUpdate.username)
    updateUserForm.append('firstName',userToUpdate.username)
    updateUserForm.append('lastName',userToUpdate.username)
    updateUserForm.append('emailAddress',userToUpdate.username)

    if( headers !== undefined){
      return this.appHttp$.post<boolean>(resourceLink,updateUserForm,{headers,observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }else{
      return this.appHttp$.post<boolean>(resourceLink,updateUserForm,{observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }

  }

  removeUser(userToRemove: AppUser, endUrl: string, headers?: HttpHeaders): Observable<boolean>{

    const resourceLink: string = this.appHttp.getBaseLink()+endUrl;

    const updateUserForm: FormData = new FormData()
    updateUserForm.append('username',userToRemove.username)

    if( headers !== undefined){
      return this.appHttp$.post<boolean>(resourceLink,updateUserForm,{headers,observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }else{
      return this.appHttp$.post<boolean>(resourceLink,updateUserForm,{observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }

  }

  setSuperUser(supserUser: AppUser, endUrl: string, headers?: HttpHeaders): Observable<boolean>{

    const resourceLink: string = this.appHttp.getBaseLink()+endUrl;

    const setSuperUserForm: FormData = new FormData()
    setSuperUserForm.append('username',supserUser.username)

    if( headers !== undefined){
      return this.appHttp$.post<boolean>(resourceLink,setSuperUserForm,{headers,observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }else{
      return this.appHttp$.post<boolean>(resourceLink,setSuperUserForm,{observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }

  }


  removeSuperUser(supserUser: AppUser, endUrl: string, headers?: HttpHeaders): Observable<boolean>{

    const resourceLink: string = this.appHttp.getBaseLink()+endUrl;

    const setSuperUserForm: FormData = new FormData()
    setSuperUserForm.append('username',supserUser.username)

    if( headers !== undefined){
      return this.appHttp$.post<boolean>(resourceLink,setSuperUserForm,{headers,observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }else{
      return this.appHttp$.post<boolean>(resourceLink,setSuperUserForm,{observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }

  }


  setStaffUser(staffUser: AppUser, endUrl: string, headers?: HttpHeaders): Observable<boolean>{

    const resourceLink: string = this.appHttp.getBaseLink()+endUrl;

    const setStaffUserForm: FormData = new FormData()
    setStaffUserForm.append('username',staffUser.username)

    if( headers !== undefined){
      return this.appHttp$.post<boolean>(resourceLink,setStaffUserForm,{headers,observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }else{
      return this.appHttp$.post<boolean>(resourceLink,setStaffUserForm,{observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }

  }

  romoveStaffUser(staffUser: AppUser, endUrl: string, headers?: HttpHeaders): Observable<boolean>{

    const resourceLink: string = this.appHttp.getBaseLink()+endUrl;

    const romoveStaffUserForm: FormData = new FormData()
    romoveStaffUserForm.append('username',staffUser.username)

    if( headers !== undefined){
      return this.appHttp$.post<boolean>(resourceLink,romoveStaffUserForm,{headers,observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }else{
      return this.appHttp$.post<boolean>(resourceLink,romoveStaffUserForm,{observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }

  }

  activateUser(inactiveUser: AppUser, endUrl: string, headers?: HttpHeaders): Observable<boolean>{

    const resourceLink: string = this.appHttp.getBaseLink()+endUrl;

    const activateUserForm: FormData = new FormData()
    activateUserForm.append('username',inactiveUser.username)

    if( headers !== undefined){
      return this.appHttp$.post<boolean>(resourceLink,activateUserForm,{headers,observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }else{
      return this.appHttp$.post<boolean>(resourceLink,activateUserForm,{observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }

  }


  deactivateUser(activeUser: AppUser, endUrl: string, headers?: HttpHeaders): Observable<boolean>{

    const resourceLink: string = this.appHttp.getBaseLink()+endUrl;

    const activateUserForm: FormData = new FormData()
    activateUserForm.append('username',activeUser.username)

    if( headers !== undefined){
      return this.appHttp$.post<boolean>(resourceLink,activateUserForm,{headers,observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }else{
      return this.appHttp$.post<boolean>(resourceLink,activateUserForm,{observe:'body'}).pipe(
        retry(3),
        catchError(this.handleError)
      );
    }

  }


}
