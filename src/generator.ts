import { getConfig } from "./config";
import { Config, PicklistResult, SObjectFieldSchema, SObjectSchema } from "./types";

export function generateTypes(sObjectDef: SObjectSchema, config: Config) {

  const fields = sObjectDef.fields;

  const picklistTypes = getPicklistTypes(sObjectDef.name, fields);

  const relations = generateChildRelations(sObjectDef, config);

  let tsContent = `
import { SObject } from './BaseTypes';
${relations.imports}
// picklist types
${picklistTypes.typeDefs.join('\n')}

export interface ${sObjectDef.name} extends SObject {\n`;

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
    tsContent += `  ${readOnly}${fieldName}?: ${fieldType};\n`;
  });

  tsContent += relations.childrenDef;

  // close object
  tsContent += `}\n`;

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
      return 'Date | string';

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
    picklistTypes.typeDefs.push(`type ${tName} = ${buildPicklist(f)}${f.restrictedPicklist === true ? '' : ' | (string & {})'};`)
    picklistTypes.typeNames.set(f.name, tName);
  })

  return picklistTypes;
}

function additionalFieldInfo(field: SObjectFieldSchema) {
  let moreInfo = "";
  moreInfo += field.calculated ? "\n  * @Formula" : "";
  moreInfo += field.referenceTo && field.referenceTo.length > 0 ? `\n  * @RelatedTo - ${field.referenceTo?.join(",")}` : "";
  moreInfo += field.relationshipName ? `\n  * @RelationshipName - ${field.relationshipName}` : "";
  moreInfo += field.unique ? `\n  * @Unique` : "";
  moreInfo += field.autoNumber ? `\n  * @Auto Number` : "";

  const cmt = ` /**
  * @label ${field.label}
  * @type ${field.type}
  * @nillable ${field.nillable}
  * @Create ${field.createable}
  * @Update ${field.updateable}
    ${moreInfo} */`;

  return cmt;
}

function generateChildRelations(object: SObjectSchema, config: Config) {
  let childrenDef = "\n   // Child relationships\n";
  let imports = '';
  object.childRelationships?.forEach(child => {

    if (child.relationshipName) {
      const childType = config.sObjects.includes(child.childSObject) ?
        child.childSObject : "SObject"

      if (childType !== 'SObject' && childType !== object.name) {
        imports += `import { ${childType} } from './${childType}';\n`;
      }

      childrenDef += `
    /** 
     * @Object - ${child.childSObject}
     * @Field - ${child.field}
     * @cascadeDelete - ${child.cascadeDelete}
     * @restrictedDelete - ${child.restrictedDelete}
     * */
  ${child.relationshipName}?: ${childType}[];\n`

    }
  })

  return { childrenDef, imports };
}