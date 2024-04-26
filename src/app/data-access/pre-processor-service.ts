import { Injectable } from "@angular/core";
import uniqBy from 'lodash/uniqBy';
import { DragnSurveyDataItem, ItTrendsData, ItTrendsDataItem, ItTrendsPreprocessingData, RespondentCounterDataItem } from "./data.model";
import { getShortName } from "./it-trends-data/short-names";

const RESPONDENTCOUNTER_QUESTION_ID = "660862307e269053d90a1469";
const ITTRENDS_QUESTION_ID = "661454038267d5925c0091cc";


@Injectable({
    providedIn: 'root'
})
export class PreProcessorService {

    public makeRespondentCounterData(data: DragnSurveyDataItem[]) {
      return data
        .filter(dataItem => dataItem.question_id === RESPONDENTCOUNTER_QUESTION_ID)
        .map(item => {
          return item.value.reduce((acc, itemA) => {
            const alreadyPresent = acc.find(itemB => itemB.computed_response === itemA.computed_response);
            if (!alreadyPresent) {
                acc.push({ computed_response: itemA.computed_response as string, amount: 1, colored: true, isRespondent: true });
            } else {
                alreadyPresent.amount++;
            }

            return acc;
          }, [] as RespondentCounterDataItem[] )
        })
        .flat();  
    }

    public makeItTrendsData(data: DragnSurveyDataItem[]) {
      const respondents = uniqBy(data
        .filter(dataItem => dataItem.question_id === RESPONDENTCOUNTER_QUESTION_ID)
        .map(dataItem => ({
          respondent_id: dataItem.respondent_id,
          profession: dataItem.value[0].computed_response
        })), 'respondent_id');

      const respondentsByProfession = data
        .filter(dataItem => dataItem.question_id === ITTRENDS_QUESTION_ID)
        .reduce((acc, item) => {
          const respondent = respondents
            .find(respondentItem => respondentItem.respondent_id === item.respondent_id);

          if (!respondent) {
            return acc;
          }

          if (respondent.profession as string in acc) {
            acc[respondent.profession as string].push(item);
          } else {
            acc[respondent.profession as string] = [item]; 
          }
          
          return acc;
        }, {} as ItTrendsPreprocessingData);

      const dataItems = Object.entries(respondentsByProfession)
        .reduce((dataItemsAcc, [profession, respondents]) => {

          const responses = respondents.reduce((acc, { value: respondent }) => {
            const item = (respondent[0].computed_response as string[]).map(val => ({
              group: val,
              shortName: getShortName(val)
            }));

            acc.push( ...this.createResponses(item) )
            return acc;
          }, [] as ItTrendsDataItem[]);
          
          const aggregatedResponses = responses.reduce((acc, response) => {
            const alreadyPresent = acc.find(presentItem => presentItem.group === response.group);
            if (alreadyPresent) {
              alreadyPresent.amount += response.amount;
            } else {
              acc.push(response);
            }

            return acc;
          }, [] as ItTrendsDataItem[]);

          dataItemsAcc[profession] = {
            totalRespondents: respondents.length,
            items: aggregatedResponses.map(response => ({
              group: response.group,
              shortName: response.shortName,
              amount: response.amount
            }))
            .sort((a, b) => a.shortName.localeCompare(b.shortName))
          }

          return dataItemsAcc;
        }, {} as ItTrendsData);
    
      return dataItems;
    }

    private createResponses(computedResponses:  { group: string, shortName: string }[]) {
      return computedResponses.reduce((acc, response, index) => {
        acc.push({
          group: response.group,
          shortName: response.shortName,
          amount: (computedResponses.length - index)
        });
        return acc;
      }, [] as ItTrendsDataItem[]);
    }
}