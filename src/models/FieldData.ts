export interface FieldData {
    label: string;
    isMultiSelect: boolean;
    defaultValue: string;
    choices: string[];
    order: string;
}
  
export interface FieldResponse extends FieldData {
    id: number;
  }