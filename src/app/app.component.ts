import { AfterViewChecked, Component, OnInit } from '@angular/core';

import { OrganizationService } from './base-services/organization/organization.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    public organization: OrganizationService
   ) {}
}
