import { Component, ElementRef, AfterViewInit, ViewChild, effect, runInInjectionContext, Injector, CUSTOM_ELEMENTS_SCHEMA, untracked } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { EnterjsGraph, RespondentCounterDataItem } from '../../data-access/data.model';
import { createGraph } from './respondent-counter-graph/respondent-counter-graph';
import { RespondentCounterDataService } from '../../data-access/respondent-counter-data/respondent-counter-data.service';
import { useReloadIcon } from '../shared/composables/use-reload-icon';
import { useConfetti } from '../shared/composables/use-confetti';

export interface ArcData {
  endAngle: number;
  startAngle: number;
}

@Component({
  selector: 'app-respondent-counter',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatSlideToggleModule, MatExpansionModule, MatButtonModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './respondent-counter.component.html',
  styleUrl: './respondent-counter.component.scss'
})
export class RespondentCounterComponent implements AfterViewInit {
  @ViewChild('respondentCounterWrapper') respondentCounterWrapper!: ElementRef;
  @ViewChild('respondentCounterLegend') respondentCounterLegend!: ElementRef;

  protected reloadIcon = useReloadIcon();
  private confetti = useConfetti(() => this.respondentCounterWrapper.nativeElement);


  protected totalCount = 0;
  protected respondentCount = 0;
  protected graph?: EnterjsGraph<RespondentCounterDataItem[]>;

  constructor(
    protected service: RespondentCounterDataService,
    private injector: Injector
  ) {}

  ngAfterViewInit() {

    this.graph = createGraph(
      this.respondentCounterWrapper.nativeElement,
      this.respondentCounterLegend.nativeElement
    );
    
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const data = this.service.data();
        untracked(() =>this.reloadIcon.show());
        
        this.respondentCount = data
          .filter(dataItem => dataItem.isRespondent)
          .reduce((acc, item) => acc = acc + item.amount, 0);

        this.confetti.updateRespondentCount(this.respondentCount);

        this.totalCount = data
          .reduce((acc, item) => acc = acc + item.amount, 0);
        
        this.graph?.update(data);
      });
    });
  }

  protected onShowTotalChange(event: MatSlideToggleChange) {
    this.service.showPopulation = event.checked;

    const data = this.service.data();
    this.graph?.update(data);
  }
}
