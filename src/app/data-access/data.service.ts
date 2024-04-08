import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { PreProcessorService } from './pre-processor-service';
import { DragnSurveyData, RespondentCounterDataItem } from './data.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private pollingInterval?: ReturnType<typeof setTimeout>;
  public pollingIntervalDelay = 20000;

  public data = signal<RespondentCounterDataItem[]>([]);
  public _showTotal = false;

  private respondentCounterData: RespondentCounterDataItem[] = [];
  private simulatedData: RespondentCounterDataItem[] = [];

  constructor(
    private http: HttpClient,
    private preProcessor: PreProcessorService
  ) {}

  get showTotal() {
    return this._showTotal;
  }

  set showTotal(value: boolean) {
    this._showTotal = value;
    this.update();
  }

  public startDataPolling() {
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
    }

    this.loadRespondentCounterData();

    this.pollingInterval = setInterval(() => {
      this.loadRespondentCounterData();
    }, this.pollingIntervalDelay);
  }

  private loadRespondentCounterData() {
    this.http.get<DragnSurveyData[]>('https://matthias-glatthorn.de/api/enterjs')
    //this.http.get<DragnSurveyData[]>('http://localhost:8080/api/enterjs')
      .subscribe(data => {
        this.respondentCounterData = this.preProcessor.makeRespondentCounterData(data);
        
        this.update();
      });
  }

  private update() {
    const data = [
      ...this.respondentCounterData,
      ...this.generateNonRespondentsDataItem(),
      ...this.simulatedData
    ];

    const reducedData = data.reduce((acc, item) => {
      const existingItem = acc.find(accItem => accItem.computed_response === item.computed_response);
      if (existingItem) {
          existingItem.amount += item.amount;
      } else {
          acc.push({ ...item });
      }
      return acc;
    }, [] as RespondentCounterDataItem[]);

    this.data.set(reducedData);
  }

  private generateNonRespondentsDataItem() {
    if(this.respondentCounterData.length === 0) {
      return []
    }

    return [{
      computed_response: 'Nicht teilgenommen',
      colored: false,
      isRespondent: false,
      amount: this.showTotal ? 5 : 0
    }]
  }

  public addSimulatedData(item: RespondentCounterDataItem) {
    this.simulatedData.push(
      {
        computed_response: item.computed_response,
        colored: true,
        isRespondent: false,
        amount: 1
      }
    );

    this.update();
  }
}
