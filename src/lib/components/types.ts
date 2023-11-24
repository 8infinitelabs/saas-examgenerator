export interface Permissions {
  access?: {
    default: boolean,
    admin: boolean
  },
  admin?: {
    default: boolean,
    admin: boolean
  }
};
export interface User {
  displayName: string,
  email: string,
  id: string,
  permissions: Permissions[],
  photoURL: string | null | undefined,
  type: string,
};

export interface Plan {
  id: string,
  title: string,
  popular: boolean,
  priceIds: string[],
  currency: string,
  price: number,
  frequency: string,
  description: string[],
  free: boolean,
  legacy: boolean

}
export type question = {
  question: string,
  answers: string[],
}

export type questionType = {
  category: string,
  questions: question[],
};

export type chatgptSchema = {
  questionData: question,
  correctAnswer: string,
  answerExplanation: string
}
