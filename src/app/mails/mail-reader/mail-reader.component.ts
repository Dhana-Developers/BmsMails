import { Component, OnInit, ElementRef, AfterContentChecked } from '@angular/core';
import { Router } from '@angular/router';

import { ModalController } from '@ionic/angular';

import { OrganizationService } from 'src/app/base-services/organization/organization.service';
import { DepartmentsService } from 'src/app/base-services/departments/departments.service';
import { MembersService } from 'src/app/base-services/members/members.service';
import { UserService } from 'src/app/base-services/user/user.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';

import { MailsAttachmentModalComponent } from '../mails-attachment-modal/mails-attachment-modal.component';

@Component({
  selector: 'app-mail-reader',
  templateUrl: './mail-reader.component.html',
  styleUrls: ['./mail-reader.component.scss'],
})
export class MailReaderComponent implements OnInit, AfterContentChecked {

  constructor(

    public org: OrganizationService,
    public dept: DepartmentsService,
    public member: MembersService,
    public appUser: UserService,
    public appMails: MailsService,
    private appHttp: HttpService,
    private mdlCtr: ModalController,
    private appRouter: Router,
    private eleRef: ElementRef

  ) { }

  ngOnInit() {

    if (this.appUser.getMainUser().username === ''){

      this.appRouter.navigateByUrl('auth/signIn')

    }

  }
  ngAfterContentChecked(): void {
      const mailContent: any = this.eleRef.nativeElement.querySelector('.mailContent')

      if (this.appMails.mailBody.mailBodyType === 'HTML'){

        mailContent.innerHTML=this.appMails.mailBody.mailBodyPayload

      }else{
        mailContent.innerText = this.appMails.mailBody.mailBodyPayload
      }

  }
  createAttachmentModal(): void{

    this.mdlCtr.create({
      component: MailsAttachmentModalComponent
    }).then((paymentMdl: HTMLIonModalElement) => {

      paymentMdl.present();

    });

  }

}
