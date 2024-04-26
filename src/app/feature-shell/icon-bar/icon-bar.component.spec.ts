import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconBarComponent } from './icon-bar.component';
import { MatIconRegistry } from '@angular/material/icon';
import { MatIconTestingModule, FakeMatIconRegistry } from '@angular/material/icon/testing';

describe('IconBarComponent', () => {
  let component: IconBarComponent;
  let fixture: ComponentFixture<IconBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconBarComponent, MatIconTestingModule],
      providers: [
        {
          provide: MatIconRegistry,
          useClass: FakeMatIconRegistry
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IconBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
