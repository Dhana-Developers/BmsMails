import { Injectable } from '@angular/core';

import { HttpService } from '../comms/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  private mainOrganization: Organization={
    orgDomain: '',
    orgName: '',
    orgMailServer: '',
    state: 0,
    orgCreator: ''
  }

  public searchedOrgs: any={}

  public orgDepartments: Array<Department>=[]

  public orgMode: string = 'creation'

  constructor(
    private appHttp: HttpService
  ) { }


  editOrg(orgDetails:Organization,orgUser: User):Promise<Organization>{

    return new Promise<Organization>((resolve, reject) => {

      const createOrgForm: FormData = new FormData()

      createOrgForm.append('organizationDomain',orgDetails.orgDomain)
      createOrgForm.append('organizationName',orgDetails.orgName)
      createOrgForm.append('orgUser',orgUser.username)

      this.appHttp.postHttp(createOrgForm,'/orgProfile/editOrganization').then((orgResp: any) =>{

        if(orgResp.state=1){

          this.mainOrganization.state = orgResp.state;
          this.mainOrganization.orgDomain = orgResp.organizationDomain
          this.mainOrganization.orgName = orgResp.organizationName

        }

        resolve(this.mainOrganization)

      }).catch((err: any) =>{

        reject(err);

      })

    })

  }

  getOrganization(): Organization{

    return this.mainOrganization;

  }

  setMainOrganization(organizationDetails: Organization): void{

    this.mainOrganization = organizationDetails;

  }

}
