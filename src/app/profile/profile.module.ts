import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProfileRoutingModule } from './profile-routing.module';
import { AccountsComponent } from './accounts/accounts.component';
import { MembersComponent } from './members/members.component';
import { DepartmentsComponent } from './departments/departments.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { VerificationComponent } from './verification/verification.component';
import { IonicModule } from '@ionic/angular';
import { ReusablesModule } from '../reusables/reusables.module';
import { ChangeOwnerModalComponent } from './change-owner-modal/change-owner-modal.component';
import { RequestMembershipModalComponent } from './request-membership-modal/request-membership-modal.component';


@NgModule({
  declarations: [

    AccountsComponent,
    MembersComponent,
    DepartmentsComponent,
    OrganizationsComponent,
    VerificationComponent,
    ChangeOwnerModalComponent,
    RequestMembershipModalComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    IonicModule,
    ReusablesModule,
    FormsModule

  ]
})
export class ProfileModule { }
