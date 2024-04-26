import { Injectable, OnDestroy, computed, signal } from "@angular/core";
import { RespondentCounterDataItem } from "../data.model";
import { DataService } from "../data-service/data.service";
import { PreProcessorService } from "../pre-processor-service";
import { Subject, takeUntil } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RespondentCounterDataService implements OnDestroy {
  private destroy$ = new Subject<void>();

  private shouldShowPopulation = false;
  private population = 46;

  private respondentCounterData: RespondentCounterDataItem[] = []; 
  private dataSig = signal<RespondentCounterDataItem[]>([]);
  public data = computed(() => this.dataSig());
  
  private simulatedData: RespondentCounterDataItem[] = [];

  set showPopulation(value: boolean) {
    this.shouldShowPopulation = value;
    this.setDataSig();
  }

  get showPopulation() {
    return this.shouldShowPopulation;
  }

  get pollingIntervalDelay() {
    return this.service.pollingIntervalDelay;
  }

  constructor(
    protected service: DataService,
    private preProcessor: PreProcessorService
  ) {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (!data) {
          return;
        }
        
        this.respondentCounterData = this.preProcessor.makeRespondentCounterData(data);
        this.setDataSig();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setDataSig() {
    const data = [
      ...this.respondentCounterData,
      ...this.generatePopulationDataItem(this.respondentCounterData.length),
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

    this.dataSig.set(reducedData);
  }

  private generatePopulationDataItem(respondentCount: number) {
    return [{
      computed_response: 'Nicht teilgenommen',
      colored: false,
      isRespondent: false,
      amount: this.showPopulation ? this.population - respondentCount : 0
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

    this.setDataSig();
  }
}