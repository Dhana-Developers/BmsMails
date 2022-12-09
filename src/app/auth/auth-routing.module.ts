import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserAccountsComponent } from './user-accounts/user-accounts.component';
import { UserAuthComponent } from './user-auth/user-auth.component';

const routes: Routes = [

  {
    path:'',
    component:UserAccountsComponent
  },
  {
    path:'signIn',
    component:UserAuthComponent
  },
  {
    path:'signUp',
    component:UserAuthComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
