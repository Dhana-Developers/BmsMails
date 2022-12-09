import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { BsmNavComponent } from './bsm-nav/bsm-nav.component';



@NgModule({
  declarations: [
    SignUpComponent,
    SignInComponent,
    BsmNavComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports:[
    SignUpComponent,
    SignInComponent,
    BsmNavComponent
  ]
})
export class ReusablesModule { }
