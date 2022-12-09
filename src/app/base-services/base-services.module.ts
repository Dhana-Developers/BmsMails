import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpService } from './comms/http/http.service';
import { UserService } from './user/user.service';
import { OrganizationService } from './organization/organization.service';
import { DepartmentsService } from './departments/departments.service';
import { MailsService } from './mails/mails.service';
import { MembersService } from './members/members.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers:[
    HttpService,
    UserService,
    OrganizationService,
    DepartmentsService,
    MailsService,
    MembersService
  ]
})
export class BaseServicesModule { }
