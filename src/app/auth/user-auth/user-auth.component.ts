import { AfterViewChecked, Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-user-auth',
  templateUrl: './user-auth.component.html',
  styleUrls: ['./user-auth.component.scss'],
})
export class UserAuthComponent implements OnInit, AfterViewChecked {

  public routSect = "";

  constructor(

    private appRouter: Router

  ) { }

  ngOnInit() {}

  ngAfterViewChecked(): void {

    this.routSect = this.appRouter.url

   }

}
