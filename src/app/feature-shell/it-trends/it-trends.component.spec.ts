import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItTrendsComponent } from './it-trends.component';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('ItTrendsComponent', () => {
  let component: ItTrendsComponent;
  let fixture: ComponentFixture<ItTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItTrendsComponent, HttpClientModule, NoopAnimationsModule, MatIconTestingModule]
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
