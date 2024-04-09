export type DragnSurveyData = {
    created_at: string;
    id: number;
    question_id: string;
    respondent_id: string;
    value: MultipleChoiceQuestion[];
}

export type MultipleChoiceQuestion = {
    computed_response: string;
    type: 'choice';
    value: string;
}

export type RespondentCounterDataItem = {
    computed_response: string;
    colored: boolean;
    isRespondent: boolean;
    amount: number;
}

export type OnEnterCallback = (isFirst?: boolean) => void;

export type EnterjsGraph<T> = {
    update: (data: T) => void;
}