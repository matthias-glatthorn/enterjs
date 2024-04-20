import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DragnSurveyDataItem } from '../data.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private pollingInterval?: ReturnType<typeof setTimeout>;
  public pollingIntervalDelay = 20000;

  private dragnSurveyData$ = new BehaviorSubject<DragnSurveyDataItem[] | undefined>(undefined);

  get data$() {
    return this.dragnSurveyData$.asObservable();
  }

  constructor(
    private http: HttpClient
  ) {}

  public startDataPolling() {
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
    }

    this.load();
    this.pollingInterval = setInterval(() => {
      this.load();
    }, this.pollingIntervalDelay);
  }

  private load() {
    this.http.get<DragnSurveyDataItem[]>('https://matthias-glatthorn.de/api/enterjs')
      .subscribe(data => {
        this.dragnSurveyData$.next(data);
      });
  }
}
