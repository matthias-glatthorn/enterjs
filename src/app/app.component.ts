import { Component } from '@angular/core';
import { RespondentCounterComponent } from './feature-shell/respondent-counter/respondent-counter.component';
import { ItTrendsComponent } from './feature-shell/it-trends/it-trends.component';
import { IconBarComponent } from './feature-shell/icon-bar/icon-bar.component';
import { DataService } from './data-access/data-service/data.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RespondentCounterComponent, ItTrendsComponent, IconBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  title = 'enterjs';

  constructor(
    protected service: DataService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.service.startDataPolling();
    
    this.matIconRegistry.addSvgIcon(
      `github`,
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/github-mark.svg")
    );
  }
}
