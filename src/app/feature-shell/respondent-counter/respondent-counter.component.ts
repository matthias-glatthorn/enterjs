import { Component, ElementRef, AfterViewInit, ViewChild, effect, runInInjectionContext, Injector, CUSTOM_ELEMENTS_SCHEMA, untracked } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { EnterjsGraph, RespondentCounterDataItem } from '../../data-access/data.model';
import { stringToBoolean } from '../shared/string-to-boolean';
import { createGraph } from './respondent-counter-graph/respondent-counter-graph';
import { triggerConfetti } from '../shared/confetti';
import { RespondentCounterDataService } from '../../data-access/respondent-counter-data/respondent-counter-data.service';
import { useReloadIcon } from '../shared/composables/use-reload-icon';

export interface ArcData {
  endAngle: number;
  startAngle: number;
}

@Component({
  selector: 'app-respondent-counter',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatRadioModule, MatExpansionModule, MatButtonModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './respondent-counter.component.html',
  styleUrl: './respondent-counter.component.scss'
})
export class RespondentCounterComponent implements AfterViewInit {
  @ViewChild('respondentCounterWrapper') respondentCounterWrapper!: ElementRef;
  @ViewChild('respondentCounterLegend') respondentCounterLegend!: ElementRef;

  protected reloadIcon = useReloadIcon();

  protected respondentCount: number | undefined = undefined;
  protected totalCount = 0;
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

        const respondentCount = data
          .filter(dataItem => dataItem.isRespondent)
          .reduce((acc, item) => acc = acc + item.amount, 0);

        if (this.respondentCount && respondentCount > this.respondentCount) {
          triggerConfetti(this.respondentCounterWrapper.nativeElement);
        }
        this.respondentCount = respondentCount;

        this.totalCount = data
          .reduce((acc, item) => acc = acc + item.amount, 0);
        
        this.graph?.update(data);
      });
    });
  }

  protected onShowTotalChange({ value }: { value: string }) {
    const showTotal = stringToBoolean(value) ?? false;
    this.service.showTotal = showTotal ? showTotal : false;

    const data = this.service.data();
    this.graph?.update(data);
  }
}
