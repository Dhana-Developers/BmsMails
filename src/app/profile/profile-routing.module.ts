import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountsComponent } from './accounts/accounts.component';
import { DepartmentsComponent } from './departments/departments.component';
import { MembersComponent } from './members/members.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { VerificationComponent } from './verification/verification.component';

const routes: Routes = [
  {
    path:'',
    component:AccountsComponent
  },
  {
    path:'members',
    component:MembersComponent
  },
  {
    path:'departments',
    component:DepartmentsComponent
  },
  {
    path:'organizations',
    component:OrganizationsComponent
  },
  {
    path:'verify',
    component:VerificationComponent
  },
  {
    path:'accounts',
    component:AccountsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
