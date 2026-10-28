export interface IRequireAuth {
  /** `signed-in` guards the app; `signed-out` keeps a signed-in user away from the sign-in and sign-up pages. */
  when: 'signed-in' | 'signed-out';
}
