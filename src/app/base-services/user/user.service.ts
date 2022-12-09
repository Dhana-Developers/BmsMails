import { Injectable } from '@angular/core';

import { AppService } from 'src/app/app.service';
import { HttpService } from '../comms/http/http.service';

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
    private appHttp: HttpService
  ) { }

  authenticate(userDetails:AuthDetails): Promise<User>{

    return new Promise<User>((resolve, reject) => {

      const userAuthForm: FormData = new FormData()
      userAuthForm.append('username',userDetails.username)
      userAuthForm.append('password',userDetails.password)

      if (userDetails.emailAddress !== undefined){
        userAuthForm.append('userEmail',userDetails.emailAddress);
      }
      if(userDetails.firstName !== undefined){
        userAuthForm.append('firstName',userDetails.firstName);
      }
      if (userDetails.lastName !== undefined){
        userAuthForm.append('lastName',userDetails.lastName);
      }

      this.appHttp.postHttp(userAuthForm,'/bmsBase/authenticate').then((authResp: any) =>{

        this.mainUser.memberShips=[]

        if (authResp.state === 3){
          this.mainUser.authState = authResp.state
          this.mainUser.autheticated=true
          this.mainUser.dateJoined = new Date(authResp.dateJoined)
          this.mainUser.lastLogin = new Date(authResp.lastLogin)
          this.mainUser.emailAddress = authResp.emailAddress
          this.mainUser.firstName = authResp.userFirstName
          this.mainUser.lastName = authResp.userLastName
          this.mainUser.username = authResp.username

          const memberShipOrgDepartments: Array<Department> = []

          authResp.memberShips.forEach((membership: any) => {

            const departmentMembers: Array<any> = []

            membership.departmentMembers.forEach((member: any) => {

              departmentMembers.push(member)

            });

            membership.organizationDepartments.forEach((orgDept: any) => {

              const systemOrgDept: Department={
                departmentID: orgDept.departmentId,
                departmentName: orgDept.name,
                departmentOrganization: orgDept.departmentOrgId,
                state: authResp.state,
                departmentMembers: [],
                mailAccount: membership.departmentMail
              }
              memberShipOrgDepartments.push(systemOrgDept)

            });

            const sysMembership: Membership = {
              memberId: membership.memberId,
              memberUserId: membership.memberUserId,
              memberDateJoined: new Date(membership.memberDateJoined),
              departmentId: membership.departmentId,
              departmentName: membership.departmentName,
              organizationId: membership.organizationId,
              organizationName: membership.organizationName,
              organizationMail: membership.organizationMailServer,
              organizationCreator: membership.organizationCreator,
              organizationDepartments: memberShipOrgDepartments,
              departmentMembers:departmentMembers
            }

            this.mainUser.memberShips.push(sysMembership)

          });

        }else if (authResp.state === 4){
          this.mainUser.authState = authResp.state
          this.mainUser.autheticated=true
          this.mainUser.dateJoined = new Date(authResp.dateJoined)
          this.mainUser.lastLogin = new Date(authResp.lastLogin)
          this.mainUser.emailAddress = authResp.emailAddress
          this.mainUser.firstName = authResp.userFirstName
          this.mainUser.lastName = authResp.userLastName
          this.mainUser.username = authResp.username
        }else if(authResp.state === 2){
          this.mainUser.authState = authResp.state
          this.mainUser.autheticated=false
          this.mainUser.dateJoined = new Date(authResp.dateJoined)
          this.mainUser.lastLogin = new Date(authResp.lastLogin)
          this.mainUser.emailAddress = authResp.emailAddress
          this.mainUser.firstName = authResp.userFirstName
          this.mainUser.lastName = authResp.userLastName
          this.mainUser.username = authResp.username

        }else{
          this.mainUser.authState = authResp.state
          this.mainUser.autheticated=false
        }

        resolve(this.mainUser)
      }).catch((err: any) =>{
        reject(err);
      });

    });

  }

  getMainUser(): User{
    return this.mainUser
  }

  cechUserExists(username: string): Promise<boolean>{

    return new Promise<boolean>((resolve, reject) => {

      const checkUserExistsForm: FormData = new FormData()

      checkUserExistsForm.append('username',username)

      this.appHttp.postHttp(checkUserExistsForm,'/bmsBase/checkUserExists').then((resp: any)=>{

        resolve(resp.exists);

      }).catch((err: any) =>{
        reject(err)
      })

    })
  }
}
