import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { UserAccountsComponent } from './user-accounts/user-accounts.component';
import { UserAuthComponent } from './user-auth/user-auth.component';
import { IonicModule } from '@ionic/angular';
import { ReusablesModule } from '../reusables/reusables.module';


@NgModule({
  declarations: [
    UserAccountsComponent,
    UserAuthComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    IonicModule,
    ReusablesModule
  ],
  exports:[
    UserAccountsComponent,
    UserAuthComponent
  ]
})
export class AuthModule { }
