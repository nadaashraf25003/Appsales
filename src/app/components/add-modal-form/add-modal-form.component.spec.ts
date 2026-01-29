import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddModalFormComponent } from './add-modal-form.component';

describe('AddModalFormComponent', () => {
  let component: AddModalFormComponent;
  let fixture: ComponentFixture<AddModalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddModalFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddModalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
