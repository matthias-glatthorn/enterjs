import { Injectable } from "@angular/core";
import { DragnSurveyData, RespondentCounterDataItem } from "./data.model";


@Injectable({
    providedIn: 'root'
})
export class PreProcessorService {
    private respondentCounterQuestionId = "660862307e269053d90a1469";

    public makeRespondentCounterData(data: DragnSurveyData[]) {

        return data
            .filter(dataItem => dataItem.question_id === this.respondentCounterQuestionId)
            .map(item => {
                return item.value.reduce((acc, itemA) => {
                    const alreadyPresent = acc.find(itemB => itemB.computed_response === itemA.computed_response);

                    if (!alreadyPresent) {
                        acc.push({ computed_response: itemA.computed_response, amount: 1, colored: true, isRespondent: true });
                    } else {
                        alreadyPresent.amount++;
                    }
                    return acc;
                }, [] as RespondentCounterDataItem[] )
            })
            .flat();
        
    }
}