import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  public development = true;

  public loaderDivDisplay = 'nosite';

  public verified = false;

  constructor() { }
}
