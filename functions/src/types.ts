export type question = {
  question: string,
  answers: string[],
}

export type questionType = {
  category: string,
  questions: question[],
};

export type answer = {
  correctAnswer: string,
  answerExplanation: string

};
export type answers = {
  examId: string,
  answers: answers[],
};

