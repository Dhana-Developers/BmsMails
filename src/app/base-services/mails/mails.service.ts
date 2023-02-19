import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';

import { HttpService } from '../comms/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class MailsService {

  private mailServer: MailServer={
    name: '',
    address: '',
    domain: ''
  }

  private mailContacts: Array<Contact>=[]

  public mailServers: Array<MailServer>=[]
  public mailFooterPresent: boolean = false;
  public mailFooterId=0;
  public mailFooters: Array<any> = []
  public searchedContacts: Array<string> = []

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
    id:0,
    hostLoginAddress: '',
    disableMail: true,
    name: '',
    accountType: ''//member, department, organization
  };

  public mailAccountOpType: string = 'create'//edit, view, create
  public mailAccountPassword: string = ''
  public editingDisabled: boolean = false

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
  // public mailAccountType: string = 'member';

  constructor(
    private appHttp: HttpService,
    private appStorage: Storage
  ) { }

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

  searchContact(searchTerm: string): Promise<Array<string>>{

    this.searchedContacts = []

    return new Promise<Array<string>>((resolve, reject) => {

      const searchContactForm: FormData = new FormData()
      searchContactForm.append('searchTerm',searchTerm)
      searchContactForm.append('address',this.mailAccount.hostLoginAddress)

      this.appHttp.postHttp(searchContactForm,'/mails/searchContact').then((resp: Array<string>) =>{

        resp.forEach((mailContact: string) =>{

          if (!this.searchedContacts.includes(mailContact)){

            this.searchedContacts.push(mailContact)

          }

        })

        resolve(resp)

      }).catch((err: any) =>{

        reject(err)

      })

    })

  }

  setDraft(newDraft?:boolean){

    let flagId = 0;
    this.mailFlags.forEach((mailFlag: MailFlag) =>{

      if (mailFlag.flagName === 'Draft'){

        flagId = mailFlag.flagId

      }

    })

    this.appStorage.get('drafts').then((systemDrafts:Array<Draft>) =>{

      if (systemDrafts !== null && systemDrafts.length!==0){

        if (newDraft){
          const idbMailHead: IdbMailHead = this.convertToIdb(flagId)
          const newSysteDraft: Draft = {
            mailObject: this.mailObject,
            mailHead: idbMailHead,
            mailBody: this.mailBody
          }

          systemDrafts.push(newSysteDraft)

        }else{

          systemDrafts.forEach((systemDraft: Draft) =>{

            if (systemDraft.mailHead.mailObjectId === this.mailHead.mailObjectId){

              const idbMailHead: IdbMailHead = this.convertToIdb(flagId)
              systemDraft.mailHead = idbMailHead
              systemDraft.mailBody = this.mailBody
              systemDraft.mailObject = this.mailObject

            }

          })

        }

          this.appStorage.set('drafts',systemDrafts)
      }else{

      const systemDraft: Draft={
        mailObject: this.mailObject,
        mailHead: this.convertToIdb(flagId),
        mailBody: this.mailBody
      }

      this.appStorage.set('drafts', [systemDraft])

    }

    })

  }

  convertToIdb(flagId: number): IdbMailHead{

    const mailAttachments: Array<IdbMailAttachment>=[]
    this.mailHead.mailAttachments.forEach((mailAtt: MailAttachment) =>{

      const attLink: any = mailAtt.attLink?.href

      const idbMailAtt: IdbMailAttachment={
        attId: mailAtt.attId,
        attName: mailAtt.attName,
        attType: mailAtt.attType,
        attExt: mailAtt.attExt,
        objectId: mailAtt.objectId,
        attLink: attLink
      }

      mailAttachments.push(idbMailAtt)

    })

    const mailCreationTime: any = this.mailHead.creationTime?.toISOString()

    const idbMailHead: IdbMailHead={
      mailObjectId: this.mailObject.mailObjectId,
      mailSubject: this.mailHead.mailSubject,
      mailCc: this.mailHead.mailCc,
      mailBcc: this.mailHead.mailBcc,
      mailReceipients: this.mailHead.mailReceipients,
      mailAttachments: mailAttachments,
      sender: this.mailHead.sender,
      reply_to: this.mailHead.reply_to,
      creationTime: mailCreationTime,
      mailFlagId:flagId,
      spam: this.mailHead.spam,
      trashed: this.mailHead.trashed,
      archived: this.mailHead.archived
    }

    return idbMailHead

  }

  convertToMailhead(idbMailHead: IdbMailHead): MailHead{

    const mailAtts: Array<MailAttachment>=[]

    idbMailHead.mailAttachments.forEach((idbMailAttachment: IdbMailAttachment) =>{

      const mailAtt: MailAttachment = {
        attId: idbMailAttachment.attId,
        attName: idbMailAttachment.attName,
        attType: idbMailAttachment.attType,
        attExt: idbMailAttachment.attExt,
        objectId: idbMailAttachment.objectId,
        attLink:new URL(idbMailAttachment.attLink)
      }

      mailAtts.push(mailAtt)

    })


    const mailHead: MailHead = {
      mailObjectId: idbMailHead.mailObjectId,
      mailSubject: idbMailHead.mailSubject,
      mailCc: idbMailHead.mailCc,
      mailBcc: idbMailHead.mailBcc,
      mailReceipients: idbMailHead.mailReceipients,
      mailAttachments: mailAtts,
      sender: idbMailHead.sender,
      mailFlagId: idbMailHead.mailFlagId,
      reply_to: idbMailHead.reply_to,
      spam: idbMailHead.spam,
      trashed: idbMailHead.trashed,
      archived: idbMailHead.archived,
      creationTime: new Date(idbMailHead.creationTime),
      mailServerId:idbMailHead.mailServerId,
      mailHeadId:idbMailHead.mailHeadId,
    }

    return mailHead

  }

  getMailContacts(): Array<Contact>{
    return this.mailContacts
  }

  setMailContacts(mailContacts: Array<Contact>){
    this.mailContacts=mailContacts
  }

  getMailcontact(contactEmail: string): Contact{

    let mailContact: Contact={
      email: '',
      type: ''
    }

    this.mailContacts.forEach((lclMailContact: Contact) =>{

      if (lclMailContact.email == contactEmail){

        mailContact = lclMailContact

      }

    })

    return mailContact

  }

  addMailContact(mailContacts: Array<Contact>){

    mailContacts.forEach((mailContact: Contact) =>{

      this.mailContacts.push(mailContact)

    })

  }

}
