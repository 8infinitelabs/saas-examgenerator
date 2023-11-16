export type question = {
  category: string,
  type: "binary" | "multiple",
  question: string,
  answers?: string[],
  correctAnswer?: string,
};
