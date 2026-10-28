export interface IExercisePicker {
  /** Ids already in the list: shown as « Ajouté ». */
  selected: string[];
  onToggle: (exerciseId: string) => void;
  idPrefix: string;
}
