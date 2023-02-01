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
import { MailsSeverComponent } from './mails-sever/mails-sever.component';
import { FootersComponent } from './footers/footers.component';


@NgModule({
  declarations: [
    MailsListComponent,
    MailReaderComponent,
    MailWriterComponent,
    MailsAccountComponent,
    MailsAttachmentModalComponent,
    MailsSeverComponent,
    FootersComponent
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
