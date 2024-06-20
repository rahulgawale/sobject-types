export const config = {
  sObjects: [
    "Account",
    "Contact",
    "Lead",
    "Case",
    "Opportunity",
    "OpportunityLineItem",
    "Order",
    "OrderItem",
    "Quote",
    "QuoteLineItem"]
  ,
  sfPath: "sf",
  outputDir: "./.ftypes/typings",
  defaultusername: "gunguna-dev",
  sfdxDir: "../.sfdx/sfdx-config.json"
};

export const BaseTypesFileName = 'BaseTypes.ts';
export const BaseTypes = `// base Types class
export interface SObject {
  Id?: string;
  Name?: string;
  CreatedById?: string;
  LastModifiedById?: string;
  OwnerId?: string;
  CreatedDate?: Date | string;
  LastModifiedDate?: Date | string;
  SystemModstamp?: Date | string;
  IsDeleted?: boolean;
  [key: string]: any; // Additional fields
}`;

export const IndexFileName = 'Index.ts';