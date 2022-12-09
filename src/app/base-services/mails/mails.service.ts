import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MailsService {

  public mailAccount: MailAccount = {
    hostLoginAddress: '',
    disableMail: true,
  };

  public mdMailFlags: any = {
    'Unread':{iconName:'mail-unread-outline',iconColor:'unread-mails'},
    'Read':{iconName:'mail-open-outline',iconColor:'read-mails'},
    'Sent':{iconName:'send-outline',iconColor:'primary'},
    'Draft':{iconName:'save-outline',iconColor:'warning'},
    'Archive':{iconName:'archive-outline',iconColor:'danger'},
    'Spam':{iconName:'trash-bin-outline',iconColor:'spam-mails'},
    'Trash':{iconName:'trash-outline',iconColor:'danger'},
  }

  public mailObject: MailObject={
    userAccount: '',
    mailFlag: '',
    mailObjectId: 0
  }
  public mailHead:MailHead={
    mailObjectId: 0,
    mailSubject: '',
    mailCc: [],
    mailBcc: [],
    mailReceipients: [],
    mailAttachments: [],
    sender: '',
    reply_to: ''
  }
  public mailBody:MailBody={
    mailBodyId: 0,
    mailBodyParay: [],
    mailObjectId: 0
  }
  public mailFlags: Array<MailFlag>=[]
  public systemDrafts: Array<Draft>=[]
  public mailHeads: Array<MailHead> = []
  public unreadMails: Array<MailHead>=[]
  public mailSection: string = 'Reader'
  public chosenFlag:MailFlag={
    flagId: 0,
    flagName: '',
    flagMd: '',
    flagImapName: '',
    flaColor: ''
  }

  constructor() { }

  createMailFlags(systemMailFlags: any):Promise<Array<MailFlag>>{

    return new Promise<Array<MailFlag>>((resolve, reject) => {
      this.mailFlags=[]

      for ( let systemMailFlag of systemMailFlags){

          const systemDisplayFlag: MailFlag={
            flagId: systemMailFlag.flagId,
            flagName: systemMailFlag.flagName,
            flagMd: this.mdMailFlags[systemMailFlag.flagName].iconName,
            flagImapName: systemMailFlag.flagImapName,
            flaColor: this.mdMailFlags[systemMailFlag.flagName].iconColor
          };

          this.mailFlags.push(systemDisplayFlag);

          if (systemMailFlag.flagName === 'Unread'){
            this.chosenFlag = systemDisplayFlag
          }

      }

      resolve(this.mailFlags)

    })

  }

}
