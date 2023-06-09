import { Injectable } from '@angular/core';

import { AppService } from 'src/app/app.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public hostName='127.0.0.1:8000';
  public prodHostName = 'bms.vincowoods.com'; //ict.dhanatechnology.com

  constructor(

    private appService: AppService
    

  ) { }

  getHttp(path: string,requestType?: string,headers?: any): Promise<any>{

    return new Promise<any>((resolve, reject) => {

      let baseLink = '';

      if (this.appService.development){

        baseLink=`http://${this.hostName}`;

      }else{

        baseLink=`https://${this.prodHostName}`;

      }

      this.baseHttp(new FormData(),'GET',baseLink+path,requestType,headers).then((httpResp: BmsResponse)=>{

        if (requestType === 'file'){
          resolve(httpResp);
        }else{
          const responseData: any=httpResp.backendResponse;

          resolve(responseData);
        }

      }).catch((err: any)=>{

        reject(err);

      });

    });

  }

  postHttp(requestBody: FormData,path: string,
    headers?: any, requestType?:string): Promise<any>{

    return new Promise<any>((resolve, reject) => {

      let baseLink = '';

      if (this.appService.development){

        baseLink=`http://${this.hostName}`;

      }else{

        baseLink=`https://${this.prodHostName}`;

      }

      this.baseHttp(requestBody,'POST',baseLink+path,requestType,headers).then((httpResp: BmsResponse)=>{

        const responseData: any=httpResp.backendResponse;
        resolve(responseData);

      }).catch((err: any)=>{

        reject(err);

      });

    });

  }

  getBaseLink(): string{

    let baseLink = '';

    if (this.appService.development){

      baseLink=`http://${this.hostName}`;

    }else{

      baseLink=`https://${this.prodHostName}`;

    }

    return baseLink;

  }

  private baseHttp(msgBody: FormData,method: string,path: string,
    requestType?: string,headers?: any): Promise<BmsResponse>{
    return new Promise<BmsResponse>((resolve,reject)=>{

      this.appService.loaderDivDisplay='site';

      const link: string = path;
      const httpXhr=new XMLHttpRequest();

      httpXhr.open(method,link);

      if (headers !== undefined){

        for (const headerKey of Object.keys(headers)){

          httpXhr.setRequestHeader(headerKey,headers[headerKey]);

        }

      }

      httpXhr.onreadystatechange=()=>{

        if(httpXhr.status===200 && httpXhr.readyState===4){

          this.appService.loaderDivDisplay='nosite';

          if (requestType!=='file'){
            resolve(JSON.parse(httpXhr.response));
          }else{
            resolve(httpXhr.response);
          }

        }

        httpXhr.onerror=evt=>{

          this.appService.loaderDivDisplay='nosite';

          console.error(evt);

          reject([httpXhr.status,evt]);

        };

      };
      if (requestType==='file'){
        httpXhr.responseType = 'blob'
      }else{
        httpXhr.responseType= 'text'
      }
      httpXhr.send(msgBody);
    });
  }
}
