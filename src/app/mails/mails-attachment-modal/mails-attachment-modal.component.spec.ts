import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MailsAttachmentModalComponent } from './mails-attachment-modal.component';

describe('MailsAttachmentModalComponent', () => {
  let component: MailsAttachmentModalComponent;
  let fixture: ComponentFixture<MailsAttachmentModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MailsAttachmentModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MailsAttachmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
