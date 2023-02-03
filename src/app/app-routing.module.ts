import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path:'auth',
    loadChildren: () => import('./auth/auth.module').then( am => am.AuthModule)
  },
  {
    path:'profile',
    loadChildren:() => import('./profile/profile.module').then(pm =>pm.ProfileModule)
  },
  {
    path:'mails',
    loadChildren:() => import('./mails/mails.module').then(mm =>mm.MailsModule)
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, initialNavigation: 'enabledBlocking' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
