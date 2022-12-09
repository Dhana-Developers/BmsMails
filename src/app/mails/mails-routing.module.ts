import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MailReaderComponent } from './mail-reader/mail-reader.component';

import { MailWriterComponent } from './mail-writer/mail-writer.component';
import { MailsAccountComponent } from './mails-account/mails-account.component';
import { MailsListComponent } from './mails-list/mails-list.component';

const routes: Routes = [

  {
    path:'',
    component: MailsAccountComponent
  },

  {
    path:'mailsList',
    component: MailsListComponent
  },
  {
    path:'mailWriter',
    component:MailWriterComponent
  },
  {
    path:'mailReader',
    component:MailReaderComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MailsRoutingModule { }
