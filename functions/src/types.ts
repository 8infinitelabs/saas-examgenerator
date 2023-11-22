export type question = {
  question: string,
  answers: string[],
  correctAnswer?: string,
}

export type questionType = {
  category: string,
  questions: question[],
};
