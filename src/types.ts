export type NullableNumber = number | null | undefined;

export interface SObjectSchema {
  fields: SObjectFieldSchema[],
  name: string,
  label: string,
  [key: string]: any
}

export interface SObjectFieldSchema {
  label: string,
  name: string,
  type: FieldType,
  nillable: boolean,
  createable: boolean,
  updateable: boolean,
  unique: boolean,
  autoNumber: boolean,
  calculated?: boolean
  picklistValues?: PicklistValueSchema[],
  referenceTo?: string[],
  restrictedPicklist?: boolean,
  [key: string]: any
}

export interface PicklistValueSchema {
  active: boolean,
  defaultValue: boolean,
  label: string,
  validFor: string[] | null,
  value: string
}

export type FieldType = 'picklist' |
  'string' |
  'textarea' |
  'reference' |
  'id' |
  'boolean' |
  'int' |
  'currency' |
  'percent' |
  'number' |
  'double' |
  'date' |
  'datetime' |
  'any'

export interface PicklistResult {
  typeDefs: string[],
  typeNames: Map<string, string>
}

export interface SfdxConfig {
  defaultusername: string
}

export interface Config {
  sObjects: string[],
  sfPath: string,
  outputDir: string,
  defaultusername: string,
  sfdxDir: string
}

export const scriptName = 'ftypes';