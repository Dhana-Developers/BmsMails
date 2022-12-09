import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MailsRoutingModule } from './mails-routing.module';

import { File } from '@awesome-cordova-plugins/file/ngx';

import { MailsListComponent } from './mails-list/mails-list.component';
import { MailReaderComponent } from './mail-reader/mail-reader.component';
import { MailWriterComponent } from './mail-writer/mail-writer.component';
import { IonicModule } from '@ionic/angular';
import { MailsAccountComponent } from './mails-account/mails-account.component';
import { MailsAttachmentModalComponent } from './mails-attachment-modal/mails-attachment-modal.component';


@NgModule({
  declarations: [
    MailsListComponent,
    MailReaderComponent,
    MailWriterComponent,
    MailsAccountComponent,
    MailsAttachmentModalComponent
  ],
  imports: [
    CommonModule,
    MailsRoutingModule,
    IonicModule
  ],
  providers:[
    File
  ]
})
export class MailsModule { }
