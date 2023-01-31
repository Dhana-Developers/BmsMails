import { Injectable } from '@angular/core';
import { HttpService } from '../comms/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  private mainMember: Member={
    memberId: '',
    memberDepartmentId: '',
    memberUserId: ''
  }

  public mailAccounts: Array<MailAccount>=[]

  constructor(
    private appHttp: HttpService
  ) { }

  editMember(memberDetails: Member):Promise <Member>{

    return new Promise<Member>((resolve, reject) => {

      const editMemberForm: FormData = new FormData();

      editMemberForm.append('profileLink',memberDetails.memberId)
      editMemberForm.append('subdomain',memberDetails.memberDepartmentId)
      editMemberForm.append('userId',memberDetails.memberUserId)

      this.appHttp.postHttp(editMemberForm,'/orgProfile/editMember').then((editedMember: any) =>{

        this.mainMember.memberId = memberDetails.memberId
        this.mainMember.memberDepartmentId = memberDetails.memberDepartmentId
        this.mainMember.memberUserId = memberDetails.memberUserId

        console.log(editedMember);
        resolve(this.mainMember)

      }).catch((err: any) =>{
        reject(err)
      });

    })

  }

  getMainMember(): Member{

    return this.mainMember;

  }

  setMainMember(memberDetails: Member): void{

    this.mainMember = memberDetails

  }

}
