// src/client/data/sections.js
const sections = [
  {
    key: "letters",
    name: "Letters",
    description: "Learn the alphabet and letter sounds",
    labelUrl: "./labels/alphabet.json",
    sectionSizes: { Introduction: 17, Learn: 17, Practice: 17, Quiz: 17 },
  },
  {
    key: "greetings",
    name: "Basic Greetings and Salutations",
    description: "Say hello, good morning, good evening…",
    labelUrl: "./labels/greetings.json",
    sectionSizes: { Introduction: 6, Learn: 6, Practice: 6, Quiz: 6 },
  },
  {
    key: "common-words",
    name: "Common Words",
    description: "Essential nouns and adjectives",
    labelUrl: "./labels/common-words.json",
    sectionSizes: { Introduction: 5, Learn: 5, Practice: 5, Quiz: 5 },
  },
  {
    key: "numbers",
    name: "Numbers",
    description: "How to read and use numbers",
    labelUrl: "./labels/numbers.json",
    sectionSizes: { Introduction: 20, Learn: 20, Practice: 20, Quiz: 20 },
  },
  {
    key: "verbs",
    name: "Verbs",
    description: "Essential verbs and conjugations",
    labelUrl: "./labels/verbs.json",
    sectionSizes: { Introduction: 5, Learn: 5, Practice: 5, Quiz: 5 },
  },
  {
    key: "words",
    name: "Word Reading",
    description: "Combining letters into words",
    labelUrl: "./labels/words.json",
    sectionSizes: { Introduction: 5, Learn: 5, Practice: 5, Quiz: 5 },
  },
  {
    key: "sentences",
    name: "Sentence Structure",
    description: "Building phrases and sentences",
    labelUrl: "./labels/sentences.json",
    sectionSizes: { Introduction: 5, Learn: 5, Practice: 5, Quiz: 5 },
  },
];

export default sections;
