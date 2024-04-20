import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItTrendsComponent } from './it-trends.component';

describe('SecondChartComponent', () => {
  let component: ItTrendsComponent;
  let fixture: ComponentFixture<ItTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItTrendsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ItTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
