import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MedicationDetailPage } from './medication-detail.page';

describe('MedicationDetailPage', () => {
  let component: MedicationDetailPage;
  let fixture: ComponentFixture<MedicationDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicationDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
