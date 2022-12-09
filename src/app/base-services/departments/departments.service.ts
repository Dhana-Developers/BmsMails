import { Injectable } from '@angular/core';
import { HttpService } from '../comms/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentsService {

  public mainDepartment: Department={
    departmentID: '',
    departmentName: '',
    departmentOrganization: '',
    state: 0,
    departmentMembers: [],
    mailAccount: ''
  }

  public searchedDepartments: Array<Department>=[]

  constructor(
    private appHttp: HttpService
  ) { }


  editDepartment(departmentDetails:Department,depOrg: Organization):Promise<Department>{

    return new Promise<Department>((resolve, reject) => {

      const editDepartmentForm:FormData = new FormData()

      editDepartmentForm.append('departmentId',departmentDetails.departmentID)
      editDepartmentForm.append('departmentName',departmentDetails.departmentName)
      editDepartmentForm.append('orgDomain',depOrg.orgDomain)

      this.appHttp.postHttp(editDepartmentForm,'/bmsBase/editDepartment').then((resp: any) =>{

        this.mainDepartment.departmentID=resp.departmentId
        this.mainDepartment.departmentName=resp.departmentName
        this.mainDepartment.departmentOrganization=resp.departmentOrganizationId
        this.mainDepartment.state=resp.state

        resolve(this.mainDepartment)

      }).catch((err: any) =>{

        reject(err);

      })

    })

  }

  getDepartment(): Department{

    return this.mainDepartment

  }

  setDepartment(departmentDetails: Department):void{

    this.mainDepartment = departmentDetails;

  }


}
