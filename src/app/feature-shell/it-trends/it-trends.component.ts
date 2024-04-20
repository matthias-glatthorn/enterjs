import { Component, ElementRef, ViewChild, effect, untracked } from '@angular/core';
import * as d3 from 'd3';
import { ItTrendsDataService } from '../../data-access/it-trends-data/it-trends-data.service';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ProfessionGroup } from '../../data-access/data.model';
import { useReloadIcon } from '../shared/composables/use-reload-icon';

type DropdownOption = {
  value: string;
  label: string;
}

@Component({
  selector: 'app-it-trends',
  standalone: true,
  imports: [ MatCardModule, MatSelectModule, MatFormFieldModule, MatIconModule ],
  templateUrl: './it-trends.component.html',
  styleUrl: './it-trends.component.scss'
})
export class ItTrendsComponent {
  @ViewChild("xAxis") xAxis!: ElementRef;
  @ViewChild("yAxis") yAxis!: ElementRef;

  protected reloadIcon = useReloadIcon();

  protected professionDropdownOptions: DropdownOption[] = [];
  protected selected = 'all';
  protected totalRespondents = 0;
  
  protected chartWidth = 400;
  protected chartHeight = 400;
  protected chartPadding = {
    left: 40,
    right: 40,
    top: 20,
    bottom: 50
  };

  protected innerChartHeigt = this.chartHeight - this.chartPadding.top - this.chartPadding.bottom;
  protected innerChartWidth = this.chartWidth - this.chartPadding.left - this.chartPadding.right;

  xScale = d3.scaleBand()
    .range([0, this.innerChartWidth])
    .padding(0.2);

  yScale = d3.scaleLinear()
    .range([this.innerChartHeigt, 0]);

  colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  constructor(protected service: ItTrendsDataService) {
    effect(() => {
      const data = this.service.data();
      const amounts = data.map(item => item.average);
      untracked(() =>this.reloadIcon.show());
      
      this.xScale.domain(data.map(item => item.shortName));
      this.yScale.domain([ 0, Math.max(...amounts) ]);

      this.drawAxes(data.length);
    });

    effect(() => {
      const groups = this.service.groups();

      this.totalRespondents = Object.values(groups)
        .reduce((acc, { amount }) => acc += amount, 0);

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
    this.service.selectedGroup = this.selected;
  }

  private drawAxes(yAxisTicks: number) {
    const xAxis = d3.axisBottom(this.xScale);
    const xAxisGroup = d3.select(this.xAxis.nativeElement)
      .call(xAxis);
    
    xAxisGroup
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    const yAxis = d3.axisLeft(this.yScale);

    yAxis.ticks(yAxisTicks);
    
    d3.select(this.yAxis.nativeElement)
      .call(yAxis);
  }

  private updateProfessionDropdownOptions(groups: ProfessionGroup[]) {

    this.professionDropdownOptions = groups.map(group => ({
      value: group.label,
      label: `${ group.label } (${ group.amount })`
    }))
  }
}
