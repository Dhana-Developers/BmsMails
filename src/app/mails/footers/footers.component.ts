import { Component, OnInit, ElementRef } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/base-services/user/user.service';
import { MailsService } from 'src/app/base-services/mails/mails.service';
import { HttpService } from 'src/app/base-services/comms/http/http.service';

import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-footers',
  templateUrl: './footers.component.html',
  styleUrls: ['./footers.component.scss'],
})
export class FootersComponent implements OnInit {

  public footerSalutation='';
  public footerMedia = '';
  public footerRecords: Array<string> = [];
  public imgFooterLabel: string = ''

  constructor(
    private modalCtrl: ModalController,
    public users: UserService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    public mailService:MailsService,
    private appHttp: HttpService,
    private eleRef: ElementRef
    ) { }

  ngOnInit() {}

  cancel(){

    return this.modalCtrl.dismiss(null, 'cancel');

  }

  createFooter(){

    const salutationIpt: string = this.eleRef.nativeElement.querySelector('.salutationIpt').value;
    const footerName: string = this.eleRef.nativeElement.querySelector('.footerName').value;

    if (salutationIpt!=='' && footerName!==''){


      const createFooterForm: FormData = new FormData()

      createFooterForm.append('mailId',JSON.stringify(this.mailService.mailObject.mailObjectId))
      createFooterForm.append('salutation',salutationIpt)
      createFooterForm.append('footerName',footerName)

      this.showLoader('Creating Footer').then((loadingEle: HTMLIonLoadingElement) =>{

        this.appHttp.postHttp(createFooterForm,'/mails/createMailFooter').then((createdFooter: any) =>{

          loadingEle.dismiss()

          if (createdFooter.status === 1){

            this.showAlert('New Footer','New footer created.').then(() =>{

              this.mailService.mailFooterPresent = true;
              this.mailService.mailFooterId = createdFooter.id;
              this.footerSalutation=salutationIpt

              const addRecordForm: any = this.eleRef.nativeElement.querySelector('.addRecordForm')
              addRecordForm.classList.remove('nosite')

              const vwMailFooterDetails: any = this.eleRef.nativeElement.querySelector('.vwMailFooterDetails')
              vwMailFooterDetails.classList.remove('nosite')

            })

          }else{
            this.showAlert('New Footer','New footer creation failed.')
          }

        }).catch((err: any) =>{

          loadingEle.dismiss()
          this.showAlert('New Footer','Error occured please try again')
          console.error(err);

        })

      })

    }else{

      this.showAlert('New Footer','Please fill all required fields.')

    }

  }

  addFooterRecord(){

    const footerRecordIpt: string = this.eleRef.nativeElement.querySelector('.footerRecordIpt').value;

    if (footerRecordIpt !==''){

      const textRecordForm: FormData = new FormData()

      textRecordForm.append('footerId',JSON.stringify(this.mailService.mailFooterId))
      textRecordForm.append('recordType','text')
      textRecordForm.append('recordValue',footerRecordIpt)
      textRecordForm.append('recordLabel','')

      this.showLoader('Adding Record').then((loadingEle: HTMLIonLoadingElement) =>{

        this.appHttp.postHttp(textRecordForm,'/mails/addFooterRecord').then((footerRecordResp: any) =>{

          loadingEle.dismiss()

          if (footerRecordResp.status === 1){

            this.footerRecords.push(footerRecordIpt)

            this.showAlert('Footer Record','Record Added')

          }

        }).catch((err: any) =>{
          loadingEle.dismiss()
          console.error(err);
          this.showAlert('Footer Record','Error occured please try again')
        })

      })

    }

  }

  readFile(evt: any):void{

    const attFile: File = evt.target.files[0];

    const addAttForm: FormData= new FormData()
    addAttForm.append('footerMedia',attFile)
    addAttForm.append('fileName',attFile.name)
    addAttForm.append('footerId',JSON.stringify(this.mailService.mailFooterId))
    addAttForm.append('recordType','file')

    this.addRecordLabelForm().then(()=>{
      addAttForm.append('recordLabel',this.imgFooterLabel)

      this.showLoader('Adding Record').then((loadingEle: HTMLIonLoadingElement) =>{

        this.appHttp.postHttp(addAttForm,'/mails/addFooterRecord').then((footerRecordResp: any) =>{

          loadingEle.dismiss()

          if (footerRecordResp.status === 1){

            this.footerMedia = this.appHttp.getBaseLink()+footerRecordResp.fileUrl

            this.showAlert('Footer Record','Record Added').then(() =>{
              const footerMedia: any = this.eleRef.nativeElement.querySelector('.footerMedia')
              footerMedia.classList.remove('nosite')
              const fileRecordIpt: any = this.eleRef.nativeElement.querySelector('.fileRecordIpt')
              fileRecordIpt.classList.add('nosite')
            })

          }

        }).catch((err: any) =>{

          console.error(err);
          loadingEle.dismiss()
          this.showAlert('Footer Record','Record Cretation Failed')

        })

      })
    })

  }

  removeFooter(footerId: number){

    this.showAlert('Remove Footer','Are you sure the process is irreversable!',true).then(
      (alertEle: HTMLIonAlertElement) =>{

        alertEle.onDidDismiss().then((overlayEvt: any) =>{

          if (overlayEvt.role === 'continue'){

            this.showLoader('Removing Footer').then((loadingEle: HTMLIonLoadingElement) =>{

              const removeFooterForm: FormData = new FormData()

              removeFooterForm.append('id',JSON.stringify(footerId))

              this.appHttp.postHttp(removeFooterForm,'/mails/removeFooter').then(() =>{

                loadingEle.dismiss()

                this.showAlert('Remove Footer','Footer Removed.')

                let footerIndex: number = 0

                this.mailService.mailFooters.forEach((mailFooter: any) =>{

                  if (mailFooter.id = footerId){

                    this.mailService.mailFooters.splice(footerIndex,1)

                  }

                  footerIndex+=1

                })

              }).catch((err: any) =>{

                console.error(err);

                loadingEle.dismiss()
                this.showAlert('Remove Footer','Error occured please try again.')

              })

            })

          }

        })

      })

  }


  showLoader(message:string): Promise<HTMLIonLoadingElement>{

    return new Promise<HTMLIonLoadingElement>((resolve) => {

      this.loadingController.create({
        message:message
      }).then((respLoader: HTMLIonLoadingElement) =>{

        respLoader.present()
        resolve(respLoader)

      })

    })

  }

  showAlert(alertTitle:string, alertMsg: string, continueBut?: boolean): Promise<HTMLIonAlertElement>{

    let alertButs: Array<any>=[

      {
        text:'Ok',
        role:'Cancel'
      }

    ]

    if (continueBut){
      alertButs=[

        {
          text:'Cancel',
          role:'cancel'
        },

        {
          text:'Ok',
          role:'continue'
        }
  
      ]
    }



    return new Promise<HTMLIonAlertElement>((resolve, reject) => {

      this.alertCtrl.create({
        header:alertTitle,
        message: alertMsg,
        buttons:alertButs
      }).then((alertEle: HTMLIonAlertElement) =>{

        alertEle.present()

        resolve(alertEle)

      })

    })

  }

  openFooterCreator(){

    const mailFootersAdditionForm: any = this.eleRef.nativeElement.querySelector('.mailFootersAdditionForm')
    mailFootersAdditionForm.classList.remove('nosite')
  }

  cloaseFooterCreator(){

    const mailFootersAdditionForm: any = this.eleRef.nativeElement.querySelector('.mailFootersAdditionForm')
    mailFootersAdditionForm.classList.add('nosite')
  }

  getMailFooter(footerId: number){

    this.showLoader('Setting mail footer').then((loadingEle: HTMLIonLoadingElement) =>{

      const getFooterForm: FormData = new FormData()

      getFooterForm.append('id', JSON.stringify(footerId))

      this.appHttp.postHttp(getFooterForm,'/mails/getFooter').then((footerResp: any) =>{

        loadingEle.dismiss()

        this.mailService.chosenFooter=footerResp;
        this.mailService.vwMailFooterDetails='site'
        this.mailService.mailFooterPresent = true

        if (footerResp.img) {
          this.mailService.footerMediaClass='site'
        }

        this.showAlert('Mail Footer','Footer Set')

      }).catch((err: any) =>{

        console.error(err);
        loadingEle.dismiss();
        this.showAlert('Mail Footer','Error occured please try again.')

      })

    })

  }

  addRecordLabelForm(): Promise<any>{

    return new Promise<any>((resolve, reject) => {

      this.alertCtrl.create({
        header: 'Footer Record Label',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'OK',
            role: 'confirm',
          },
        ],
        inputs:[
          {
            type: 'text',
            placeholder: 'ORG LTD',
            name:'recordLabel'
          }
        ]
      }).then((recordLabelCreationAlert: HTMLIonAlertElement) => {

        recordLabelCreationAlert.present().then(() =>{

          recordLabelCreationAlert.onDidDismiss().then((recordLabelAdditionOverlay: any) =>{

            const dataRole: any = recordLabelAdditionOverlay.role;

            if (dataRole === 'confirm'){
              this.imgFooterLabel = recordLabelAdditionOverlay.data.values.recordLabel;

              this.showAlert('Record Label Added','Record Label').then(()=>{

                resolve('')

              });
            }else{

              this.showAlert('Record Not Added','Record Label').then(()=>{

                resolve('')

              });
            };

          });

        });

      });
    })

  }


}
