export type DragnSurveyDataItem = {
  created_at: string;
  id: number;
  question_id: string;
  respondent_id: string;
  value: MultipleChoiceQuestion[] | RatingQuestion[];
}

export type ItTrendsPreprocessingData = {
  [key: string]: DragnSurveyDataItem[];
}

export type ItTrendsResponseItem = {
  group: string;
  shortName: string;
  amount: number;
}

export type ItTrendsDataItem = {
  group: string;
  shortName: string;
  average: number;
}

export type ItTrendsData = {
  [key: string]: {
    totalRespondents: number;
    averages: ItTrendsDataItem[]
  }
}

export type ProfessionGroup = {
  label: string;
  amount: number;
}

export type MultipleChoiceQuestion = {
  computed_response: string;
  type: 'choice';
  value: string;
}

export type RatingQuestion = {
  computed_response: string[];
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