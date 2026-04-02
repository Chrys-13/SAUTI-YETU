import { TrainingModule } from "./types";

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: "1",
    titleSw: "Moduli 1: Haki za Mpiga Kura",
    titleEn: "Module 1: Voter Rights",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    duration: "2min",
    completed: false,
    isDownloaded: false,
    quiz: {
      questionSw: "Haki yako ya msingi ni nini?",
      questionEn: "What is your basic right?",
      optionsSw: ["Kupiga kura", "Kukaa nyumbani", "Kulalamika tu", "Kupuuza"],
      optionsEn: ["To vote", "To stay home", "To just complain", "To ignore"],
      correctIndex: 0,
    },
  },
  {
    id: "2",
    titleSw: "Moduli 2: Utaratibu wa Kituo",
    titleEn: "Module 2: Polling Station Procedures",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "3min",
    completed: false,
    isDownloaded: false,
    quiz: {
      questionSw: "Nani anaruhusiwa kuwepo kituoni?",
      questionEn: "Who is allowed at the station?",
      optionsSw: ["Watu wote", "Wapiga kura na wasimamizi", "Wageni tu", "Hakuna mtu"],
      optionsEn: ["Everyone", "Voters and officials", "Guests only", "Nobody"],
      correctIndex: 1,
    },
  },
];

export const REPORT_TYPES = [
  { value: "ufunguzi", labelSw: "Ufunguzi wa Kituo", labelEn: "Station Opening" },
  { value: "upigaji", labelSw: "Upigaji Kura | Polling", labelEn: "Polling Process" },
  { value: "uhesabuji", labelSw: "Uhesabuji Kura | Counting", labelEn: "Vote Counting" },
  { value: "vurugu", labelSw: "Vurugu | Disturbance", labelEn: "Disturbance" },
  { value: "nyingine", labelSw: "Nyingine | Other", labelEn: "Other" },
];
