import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { EnterjsService } from '../../data-access/enterjs.service';

@Component({
  selector: 'app-respondent-counter',
  standalone: true,
  imports: [MatCardModule, MatProgressBarModule],
  providers: [EnterjsService],
  templateUrl: './respondent-counter.component.html',
  styleUrl: './respondent-counter.component.scss'
})
export class RespondentCounterComponent implements AfterViewInit {
  @ViewChild('respondentCounterChart') respondentCounterChart!: ElementRef;
  
  constructor(
    protected service: EnterjsService
  ) {}

  ngAfterViewInit() {
    console.log(this.respondentCounterChart.nativeElement)
  }
}
