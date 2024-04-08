import { Component, ElementRef, AfterViewInit, ViewChild, effect, runInInjectionContext, Injector, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { DataService } from '../../data-access/data.service';
import { CommonModule } from '@angular/common';
import { EnterjsGraph, RespondentCounterDataItem } from '../../data-access/data.model';
import { stringToBoolean } from '../../shared/util-common/string-to-boolean';
import { createGraph } from './respondent-counter-graph/respondent-counter-graph';

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

  protected respondentCount = 0;
  protected totalCount = 0;
  protected graph?: EnterjsGraph<RespondentCounterDataItem[]>;

  protected reloadIcon = false;

  constructor(
    protected service: DataService,
    private injector: Injector
  ) {
    this.service.startDataPolling();
  }

  ngAfterViewInit() {

    this.graph = createGraph(
      this.respondentCounterWrapper.nativeElement,
      this.respondentCounterLegend.nativeElement
    );
    
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const data = this.service.data();

        this.showReloadIcon();

        this.respondentCount = data
          .filter(dataItem => dataItem.isRespondent)
          .reduce((acc, item) => acc = acc + item.amount, 0);

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

  private showReloadIcon() {
    this.reloadIcon = true;

    setTimeout(() => {
      this.reloadIcon = false;
    }, 500);
  }

}
