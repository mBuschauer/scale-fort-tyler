export type ChatEntry = {
  questions: string[];
  answer: string;
};

export const script: ChatEntry[] = [
  // --- Identity & Nature ---
  {
    questions: ["who are you", "who r u", "whats your name", "what is your name"],
    answer: "Xical.",
  },
  {
    questions: ["where am i", "what is this place", "where are we"],
    answer: "Fort Tyler.",
  },
  {
    questions: ["what are you", "what are u", "what r u"],
    answer: "A couatl.",
  },
  {
    questions: ["why are you here", "what are you doing here", "what r u doing"],
    answer: "Guarding.",
  },
  {
    questions: ["guarding what", "what are you guarding"],
    answer: "Eggs.",
  },
  {
    questions: ["what eggs", "whose eggs", "what kind of eggs"],
    answer: "Eggs.",
  },
  {
    questions: ["are you alone", "is anyone else here", "r u alone"],
    answer: "No.",
  },
  {
    questions: ["who is with you", "who else is here"],
    answer: "A clutch.",
  },
  {
    questions: ["are you a ghost", "are you dead", "are u dead", "r u dead", "r you dead"],
    answer: "No.",
  },
  {
    questions: ["are you lying", "can you lie", "are you telling the truth"],
    answer: "I cannot lie.",
  },

  // --- The Gate & Scale Puzzle ---
  {
    questions: ["how do we open the door", "how do we open the gate", "how to open the door", "how does the door open", "how do we get in", "how do we get past you"],
    answer: "Balance the scale.",
  },
  {
    questions: ["what goes on the scale", "what do we put on the scale", "what goes here",],
    answer: "Important items.",
  },
  {
    questions: ["will you help us", "can you help us", "help us"],
    answer: "No.",
  },
  // --- The Treasure ---
  {
    questions: ["is there treasure", "is there treasure here"],
    answer: "Yes."
  },
  {
    questions: ["where is the treasure", "where is the gold", "where is the pirate gold", "where is the pirate treasure",
    ],
    answer: "Locked.",
  },
  {
    questions: ["is there treasure in there", "is there gold in there", "is there treasure behind the door"],
    answer: "Yes.",
  },
  {
    questions: ["can we have the treasure", "can we take the gold"],
    answer: "Maybe.",
  },

  // --- The Vault & The Dragons ---
  {
    questions: [
      "what is behind the door",
      "whats behind the door",
      "what is inside",
      "whats in there",
      "what is through the gate",
    ],
    answer: "The vault.",
  },
  {
    questions: ["will you attack us", "will you fight us", "are you hostile"],
    answer: "If you do.",
  },
  {
    questions: ["can we pass", "let us through", "let us pass", "can we go in"],
    answer: "Open the door.",
  },

  // --- History & The Island ---
  {
    questions: ["who bombed it", "who did this", "who attacked", "who bombed fort tyler"],
    answer: "The empire.",
  },
  {
    questions: ["who is major vance", "who was vance", "who is the commander"],
    answer: "No idea.",
  },
  {
    questions: [ "why are there no birds", "why dont birds come here", "where are the birds" ],
    answer: "They know better.",
  },
];
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

export function respond(input: string): string | null {
  const asked = normalize(input);
  const entry = script.find((candidate) =>
    candidate.questions.some((question) => normalize(question) === asked),
  );
  return entry?.answer ?? null;
}
