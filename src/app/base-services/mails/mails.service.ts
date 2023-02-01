import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MailsService {

  private mailServer: MailServer={
    name: '',
    address: '',
    domain: ''
  }

  public mailServers: Array<MailServer>=[]
  public mailFooterPresent: boolean = false;
  public mailFooterId=0;
  public mailFooters: Array<any> = []

  public footerRecord: any = {
    'id':0,
    'value':''
  }

  public chosenFooter: any = {

    'id':0,
    'salutation':'',
    'name':'',
    'img':false,
    'footerRecords':[],
    'footerMedia':{},

  }

  public vwMailFooterDetails = 'nosite'
  public footerMediaClass = 'nosite'

  public mailAccount: MailAccount = {
    hostLoginAddress: '',
    disableMail: true,
    name: '',
    accountType: ''
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
    reply_to: '',
    mailFlagId: 0,
    spam: false,
    trashed: false,
    archived: false
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
  public mailAccountType: string = 'member';//member, department, organization

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

  getMainMailServer(): MailServer{

    return this.mailServer

  }

  setMainMailServer(mailServerDetails: MailServer): MailServer{

    this.mailServer.address = mailServerDetails.address
    this.mailServer.domain = mailServerDetails.domain
    this.mailServer.name = mailServerDetails.name

    return this.mailServer

  }

  getMailFlag(flagId: number):MailFlag{

    let sysmailFlag: MailFlag={
      flagId: 0,
      flagName: '',
      flagMd: '',
      flagImapName: '',
      flaColor: ''
    }

    this.mailFlags.forEach((mailFlag: MailFlag) =>{

      if (mailFlag.flagId === flagId){

        sysmailFlag = mailFlag

      }

    })

    return sysmailFlag

  }

}
