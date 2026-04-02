export interface Report {
  id: string;
  type: string;
  description: string;
  stationNumber?: string;
  votingBoothNumber?: string;
  timestamp: number;
  status: 'offline' | 'sent';
  location?: {
    lat: number;
    lng: number;
  };
  media?: string; // base64 for now
}

export interface TrainingModule {
  id: string;
  titleSw: string;
  titleEn: string;
  videoUrl: string;
  duration: string;
  completed: boolean;
  quiz: {
    questionSw: string;
    questionEn: string;
    optionsSw: string[];
    optionsEn: string[];
    correctIndex: number;
  };
}
