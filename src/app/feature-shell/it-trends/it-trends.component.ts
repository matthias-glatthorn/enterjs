import { Component, ElementRef, ViewChild, effect, untracked } from '@angular/core';
import * as d3 from 'd3';
import { ItTrendsDataService } from '../../data-access/it-trends-data/it-trends-data.service';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ItTrendsDataItem, ItTrendsDisplayItem, ProfessionGroup } from '../../data-access/data.model';
import { useReloadIcon } from '../shared/composables/use-reload-icon';
import { SortByStringLengthPipe } from '../shared/pipes/sort-by-string-length.pipe';
import { unionBy } from 'lodash';
import { useConfetti } from '../shared/composables/use-confetti';

type DropdownOption = {
  value: string;
  label: string;
  amount: number;
}

type DragItemData = {
  group: string;
  shortName: string;
}

@Component({
  selector: 'app-it-trends',
  standalone: true,
  imports: [
    MatCardModule, MatSelectModule, MatFormFieldModule, MatIconModule, MatExpansionModule, MatButtonModule, MatChipsModule, SortByStringLengthPipe,
    CdkDropList, CdkDrag
  ],
  templateUrl: './it-trends.component.html',
  styleUrl: './it-trends.component.scss'
})
export class ItTrendsComponent {
  @ViewChild("xAxis") xAxis!: ElementRef;
  @ViewChild("yAxis") yAxis!: ElementRef;
  @ViewChild('itTrendsWrapper') itTrendsWrapper!: ElementRef;

  protected reloadIcon = useReloadIcon();
  private confetti = useConfetti(() => this.itTrendsWrapper.nativeElement);

  protected professionDropdownOptions: DropdownOption[] = [];
  protected professionFilter = 'all';

  protected selectedSimulatedDataProfession?: string;
  protected simulatedDataSorting: DragItemData[] = [];

  protected respondentCount = 0;
  
  protected chartWidth = 350;
  protected chartHeight = 350;
  protected scaleHeight = 24;
  protected highestPossibleRating = 6;

  xScale = d3.scaleBand()
    .range([0, this.chartHeight]);

  yScale = d3.scaleLinear()
    .range([0, this.chartHeight]);

  colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  constructor(protected service: ItTrendsDataService) {
    effect(() => {
      const data = this.service.data();
      untracked(() =>this.reloadIcon.show());
      
      this.xScale.domain(data.map(item => item.shortName));
      this.yScale.domain([ 0, this.highestPossibleRating ]);

      this.drawAxes(data.length);
      this.updateSimulatedDataSortingDragItems(data);
    });

    effect(() => {
      const groups = this.service.groups();

      this.respondentCount = Object.values(groups)
        .reduce((acc, { amount }) => acc += amount, 0);
      
      this.confetti.updateRespondentCount(this.respondentCount);

      this.updateProfessionDropdownOptions(groups)
    });
  }

  protected translate(x: number, y: number) {
    return `translate(${x}, ${y})`;
  }

  protected rotate(degrees: number) {
    return `rotate(${degrees})`;
  }

  protected onProfessionDropdownChange() {
    this.service.selectedGroup = this.professionFilter;
  }

  protected onCdkListItemDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.simulatedDataSorting, event.previousIndex, event.currentIndex);
  }

  protected addSimulatedData() {
    if (!this.selectedSimulatedDataProfession) {
      return;
    }

    const dataItems: ItTrendsDataItem[] = [];
    
    for (let index=0; index<this.simulatedDataSorting.length; index++) {
      const dragItemData = this.simulatedDataSorting[index];
      dataItems.push({
        group: dragItemData.group,
        shortName: dragItemData.shortName,
        amount: this.simulatedDataSorting.length - index
      })
    }

    this.service.addSimulatedData(this.selectedSimulatedDataProfession, dataItems);
  }

  private drawAxes(yAxisTicks: number) {

    const invertedYScale = d3.scaleLinear()
      .range(this.yScale.range().reverse())
      .domain(this.yScale.domain()); // because in svg the positive y-axis is pointing down

    const xAxis = d3.axisBottom(this.xScale);
    d3.select(this.xAxis.nativeElement)
      .call(xAxis);
    
    const yAxis = d3.axisLeft(invertedYScale);
    yAxis.ticks(yAxisTicks);
    
    d3.select(this.yAxis.nativeElement)
      .call(yAxis)
      .attr("transform", `translate(${this.scaleHeight}, 0)`);
  }

  private updateSimulatedDataSortingDragItems(data: ItTrendsDisplayItem[]) {
    const dragItems = data.map(item => ({
      group: item.group,
      shortName: item.shortName
    }));

    this.simulatedDataSorting = unionBy(this.simulatedDataSorting, dragItems, 'shortName');
  }

  private updateProfessionDropdownOptions(groups: ProfessionGroup[]) {
    this.professionDropdownOptions = groups.map(group => ({
      value: group.label,
      label: `${ group.label }`,
      amount: group.amount
    }));

    if(!this.selectedSimulatedDataProfession && groups.length > 0) {
      this.selectedSimulatedDataProfession = groups[0].label;
    }
  }
}

