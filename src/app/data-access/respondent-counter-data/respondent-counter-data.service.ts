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

  private shouldShowTotal = false;

  private respondentCounterData: RespondentCounterDataItem[] = []; 
  private dataSig = signal<RespondentCounterDataItem[]>([]);
  public data = computed(() => this.dataSig());
  
  private simulatedData: RespondentCounterDataItem[] = [];

  set showTotal(value: boolean) {
    this.shouldShowTotal = value;
    this.setDataSig();
  }

  get showTotal() {
    return this.shouldShowTotal;
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

    this.dataSig.set(reducedData);
  }

  private generateNonRespondentsDataItem() {
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

    this.setDataSig();
  }
}