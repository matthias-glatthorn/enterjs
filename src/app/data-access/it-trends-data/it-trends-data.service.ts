import { Injectable, OnDestroy, computed, signal } from "@angular/core";
import { ItTrendsData, ItTrendsDataItem, ProfessionGroup } from "../data.model";
import { DataService } from "../data-service/data.service";
import { BehaviorSubject, Subject, takeUntil } from "rxjs";
import { PreProcessorService } from "../pre-processor-service";
import { cloneDeep } from "lodash";

@Injectable({
  providedIn: 'root'
})
export class ItTrendsDataService implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  private selectedGroup$ = new BehaviorSubject<string>('all');
  private dataSig = signal<ItTrendsDataItem[]>([]);
  public data = computed(() => this.dataSig());
  private groupsSig = signal<ProfessionGroup[]>([]);
  public groups = computed(() => this.groupsSig());

  private itTrendsData?: ItTrendsData;

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
    
    if (!this.itTrendsData) {
      this.dataSig.set([]);
      return;
    }

    if (this.selectedGroup === 'all') {
      const itTrendsData = cloneDeep(this.itTrendsData);
      const aggregatedResponses = Object.values(itTrendsData).reduce((acc, { averages }) => {
        for (const item of averages) {
          const alreadyPresent = acc.find(accItem => accItem.group === item.group);
          if (!alreadyPresent) {
            acc.push(item);
          } else {
            alreadyPresent.average += item.average;
          }
        }
        
        return acc;
      }, [] as ItTrendsDataItem[]);

      const averageResponses = aggregatedResponses.map(response => ({
        ...response,
        average: response.average / Object.keys(this.itTrendsData!).length
      }));

      this.dataSig.set(averageResponses);
    } else {
      const responses = this.itTrendsData[this.selectedGroup];
      this.dataSig.set(responses.averages);
    }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}