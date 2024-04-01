import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespondentCounterComponent } from './respondent-counter.component';

describe('RespondentCounterComponent', () => {
  let component: RespondentCounterComponent;
  let fixture: ComponentFixture<RespondentCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RespondentCounterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RespondentCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
