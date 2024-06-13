import { PicklistResult, SObjectFieldSchema, SObjectSchema } from "./types";
import * as path from 'path';

export function generateTypes(sObjectDef: SObjectSchema) {
  const a: SObjectSchema = {
    fields: [],
    name: "test",
    label: "test"
  }
  const sObjectName = path.basename(sObjectDef.name, '.json');
  const fields = sObjectDef.fields;

  const picklistTypes = getPicklistTypes(sObjectDef.name, fields);

  let tsContent = `
// picklist types
${picklistTypes.typeDefs.join('\n')}
declare module "@sobject-types/${sObjectName}"{\n
  export interface ${sObjectName} {\n`;

  fields.forEach((field, i) => {
    let fieldType: string;
    const fieldName = field.name;

    if (field.type === "picklist") {
      fieldType = picklistTypes.typeNames.get(field.name) as string;
    } else {
      fieldType = mapFieldType(field.type);
    }
    // const optional = field.nillable ? '?' : '';
    const readOnly = field.calculated || field.autoNumber ? "readonly " : "";
    tsContent += `${additionalFieldInfo(field)}\n`;
    tsContent += `    ${readOnly}${fieldName}?: ${fieldType};\n`;
  });

  tsContent += `  }
  }\n`;

  return tsContent;
}

function mapFieldType(salesforceType: string) {
  switch (salesforceType) {
    // picklist
    case 'picklist':
    // texts
    case 'string':

    case 'textarea':
    case 'reference':
    case 'id':
      return 'string';

    // boolean
    case 'boolean':
      return 'boolean';

    // numbers
    case 'int':
    case 'currency':
    case 'percent':
    case 'number':
    case 'double':
      return 'number';

    // dates
    case 'date':
    case 'datetime':
      return 'Date';

    // other
    default:
      return 'any';
  }
}

function buildPicklist(field: SObjectFieldSchema) {
  if (field.picklistValues) {
    const active = field.picklistValues.filter(p => p.active === true).map(p => `'${p.value}'`);
    return active.join(" | ");
  }
  return "";
}

function getPicklistTypes(objName: string, field: SObjectFieldSchema[]) {
  const picklistTypes: PicklistResult = {
    typeDefs: [],
    typeNames: new Map()
  };

  field.filter(f => f.type === "picklist").forEach(f => {
    let tName = `${objName}_${f.name}_Picklist`;
    picklistTypes.typeDefs.push(`type ${tName} = ${buildPicklist(f)};`)
    picklistTypes.typeNames.set(f.name, tName);
  })

  return picklistTypes;
}

function additionalFieldInfo(field: SObjectFieldSchema) {
  let moreInfo = "";
  moreInfo += field.calculated ? "\n    @Formula" : "";
  moreInfo += field.referenceTo && field.referenceTo.length > 0 ? `\n   @Related To ${field.referenceTo?.join(",")}` : "";
  moreInfo += field.relationshipName ? `\n    @Relationship-Name ${field.relationshipName}` : "";
  moreInfo += field.unique ? `\n    @Unique` : "";
  moreInfo += field.autoNumber ? `\n    @Auto Number` : "";

  const cmt = `    /**
    @label ${field.label}
    @type ${field.type}
    @nillable ${field.nillable}
    @Create ${field.createable}
    @Update ${field.updateable}
    ${moreInfo}*/`;

  return cmt;
}