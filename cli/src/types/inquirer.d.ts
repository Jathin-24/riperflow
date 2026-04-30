declare module 'inquirer' {
  export interface Question {
    type: string;
    name: string;
    message: string;
    choices?: Array<{ name: string; value: string; checked?: boolean }>;
    default?: any;
    validate?: (input: any) => boolean | string;
  }

  export interface Answers {
    [key: string]: any;
  }

  export function prompt(questions: Question | Question[]): Promise<Answers>;
}
