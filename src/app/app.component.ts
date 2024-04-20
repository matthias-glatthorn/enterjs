import { Component } from '@angular/core';
import { RespondentCounterComponent } from './feature-shell/respondent-counter/respondent-counter.component';
import { ItTrendsComponent } from './feature-shell/it-trends/it-trends.component';
import { DataService } from './data-access/data-service/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RespondentCounterComponent, ItTrendsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  title = 'enterjs';

  constructor(
    protected service: DataService
  ) {
    this.service.startDataPolling();
  }
}
