import { Component } from '@angular/core';
import { RespondentCounterComponent } from './feature-shell/respondent-counter/respondent-counter.component';
import { SecondChartComponent } from './feature-shell/second-chart/second-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RespondentCounterComponent, SecondChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'enterjs';
}
