export interface ISignInInput {
  email: string;
  password: string;
}

export interface ISignUpInput extends ISignInInput {
  name: string;
}
