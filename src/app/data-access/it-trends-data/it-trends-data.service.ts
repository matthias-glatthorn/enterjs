import { Injectable, OnDestroy, computed, signal } from "@angular/core";
import { ItTrendsData, ItTrendsDataItem, ItTrendsDisplayItem, ProfessionGroup } from "../data.model";
import { DataService } from "../data-service/data.service";
import { BehaviorSubject, Subject, takeUntil } from "rxjs";
import { PreProcessorService } from "../pre-processor-service";
import { chain, cloneDeep, sumBy } from "lodash";

@Injectable({
  providedIn: 'root'
})
export class ItTrendsDataService implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  private selectedGroup$ = new BehaviorSubject<string>('all');
  private dataSig = signal<ItTrendsDisplayItem[]>([]);
  public data = computed(() => this.dataSig());
  private groupsSig = signal<ProfessionGroup[]>([]);
  public groups = computed(() => this.groupsSig());

  private itTrendsData?: ItTrendsData;
  private simulatedData: ItTrendsData = {};

  get selectedGroup() {
    return this.selectedGroup$.getValue();
  }

  set selectedGroup(selectedGroup: string) {
    this.selectedGroup$.next(selectedGroup);
  }

  get pollingIntervalDelay() {
    return this.service.pollingIntervalDelay;
  }

  constructor(
    protected service: DataService,
    private preProcessor: PreProcessorService
  ) {
    this.service.data$
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe(data => {
        if (!data) {
          return;
        }
        this.itTrendsData = this.preProcessor.makeItTrendsData(data);

        this.setData();
        this.setGroups();
      });

    this.selectedGroup$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.setData();
    });
  }

  private setData() {
    const itTrendsData = this.aggregateSimulatedData(this.itTrendsData);
    const totalRespondentCount = Object.values(itTrendsData).reduce((acc, { totalRespondents }) =>  acc += totalRespondents, 0);

    let averageResponses: ItTrendsDisplayItem[] = [];

    if (this.selectedGroup === 'all') {
      const aggregatedResponses = Object.values(itTrendsData)
        .reduce(
          (acc, { items }) => this.aggregateItTrendsDataItems(acc, items),
          [] as ItTrendsDataItem[]
        );

      averageResponses = aggregatedResponses.map(response => ({
        ...response,
        average: response.amount / totalRespondentCount
      }));

    } else {
      const responses = itTrendsData[this.selectedGroup];
      averageResponses = responses.items.map(response => ({
        ...response,
        average: response.amount / responses.totalRespondents
      }));
    }
    
    this.dataSig.set(averageResponses);
  }
  
  private setGroups() {
    const itTrendsData = this.aggregateSimulatedData(this.itTrendsData);

    const respondentGroups: ProfessionGroup[] = Object.entries(itTrendsData).map(([label, dataItem]) => ({
      label,
      amount: dataItem.totalRespondents
    }));

    this.groupsSig.set(respondentGroups);
  }

  public addSimulatedData(group: keyof ItTrendsData, dataItems: ItTrendsDataItem[]) {
    const alreadyPresent = this.simulatedData[group];
    if (!alreadyPresent) {
      this.simulatedData[group] = {
        totalRespondents: 1,
        items: dataItems
      }
    } else {
      alreadyPresent.totalRespondents++;
      alreadyPresent.items = this.aggregateItTrendsDataItems(alreadyPresent.items, dataItems);
    }

    this.setData();
    this.setGroups();
  }

  private aggregateSimulatedData(aggregate?: ItTrendsData) {
    const itTrendsDataAgg = cloneDeep(aggregate ?? {});
    for (const [group, simulatedData] of Object.entries(this.simulatedData)) {
      const alreadyPresent = itTrendsDataAgg[group];
      if (!alreadyPresent) {
        itTrendsDataAgg[group] = simulatedData;
      } else {
        alreadyPresent.totalRespondents += simulatedData.totalRespondents;
        alreadyPresent.items = this.aggregateItTrendsDataItems(alreadyPresent.items, simulatedData.items);
      }
    }
    return itTrendsDataAgg;
  }

  private aggregateItTrendsDataItems(itTrendsDataItemsA: ItTrendsDataItem[], itTrendsDataItemsB: ItTrendsDataItem[]) {
    return chain([...itTrendsDataItemsA, ...itTrendsDataItemsB])
    .groupBy('shortName')
    .map((items) => ({
      ...items[0],
      amount: sumBy(items, 'amount')
    }))
    .value();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}