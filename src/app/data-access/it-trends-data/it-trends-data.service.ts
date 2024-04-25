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
    const itTrendsData = cloneDeep(this.itTrendsData ?? {});

    // aggregate simulated data
    for (const [group, simulatedData] of Object.entries(this.simulatedData)) {
      const alreadyPresent = itTrendsData[group];
      if (!alreadyPresent) {
        itTrendsData[group] = simulatedData;
      } else {
        alreadyPresent.totalRespondents++;
        alreadyPresent.items = chain([...alreadyPresent.items, ...simulatedData.items])
          .groupBy('shortName')
          .map((items) => ({
            ...items[0],
            amount: sumBy(items, 'amount')
          }))
          .value();
      }
    }

    console.log(itTrendsData);

    let averageResponses: ItTrendsDisplayItem[] = [];

    if (this.selectedGroup === 'all') {

      const aggregatedResponses = Object.values(itTrendsData).reduce((acc, { items }) => {
        for (const item of items) {
          const alreadyPresent = acc.find(accItem => accItem.group === item.group);
          if (!alreadyPresent) {
            acc.push({
              ...item,
              amount: item.amount
            });
          } else {
            alreadyPresent.amount += item.amount;
          }
        }
        
        return acc;
      }, [] as ItTrendsDataItem[]);

      const aggregatedRespondents = Object.values(itTrendsData).reduce((acc, { totalRespondents }) =>  acc += totalRespondents, 0);

      averageResponses = aggregatedResponses.map(response => ({
        ...response,
        average: response.amount / aggregatedRespondents
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
    if (!this.itTrendsData) {
      this.groupsSig.set([]);
      return;
    }

    const respondentGroups: ProfessionGroup[] = Object.entries(this.itTrendsData).map(([label, dataItem]) => ({
      label,
      amount: dataItem.totalRespondents
    }));

    this.groupsSig.set(respondentGroups);
  }

  public addSimulatedData(group: keyof ItTrendsData, dataItems: ItTrendsDataItem[]) {
    const alreadyPresentGroup = this.simulatedData[group];
    /*
    if(!alreadyPresentGroup) {
      this.simulatedData[group] = {
        totalRespondents: 1,
        items: [{
          group: itTrendsGroup,
          shortName: itTrendsShortName,
          amount: itTrendsRating
        }]
      }
    } else {
      alreadyPresentGroup.totalRespondents++;
      const alreadyPresentItem = alreadyPresentGroup.items.find(item => item.shortName === itTrendsShortName);
      if(!alreadyPresentItem) {
        alreadyPresentGroup.items.push({
          group: itTrendsGroup,
          shortName: itTrendsShortName,
          amount: itTrendsRating
        })
      } else {
        alreadyPresentItem.amount += itTrendsRating;
      }
    }
    this.setData();
    */
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}