# @forcetrails/sobject-types

## Overview

The `@forcetrails/sobject-types` Tool is a command-line utility built to automate the generation of TypeScript definition files (`.ts`) for Salesforce objects. These definition files are crucial for projects containing TypeScript LWC components or LWC components with JSDocs, providing type safety and autocompletion support.

The tool fetches metadata for specified Salesforce objects, extracts fields and their corresponding data types, and generates TypeScript interfaces that mirror the structure of these Salesforce objects.

## Prerequisites

Before installing and using the tool, ensure you have the following prerequisites:

- Node.js (version >= 12.0.0)
- npm (Node Package Manager)
- Salesforce CLI installed and authenticated with at least one Salesforce organization. Install Salesforce CLI from here.

## Installation

#### 1. Install using npm

```bash
npm i @forcetrails/sobject-types
```

#### 2. Configure Salesforce Connection:

Update the `./ftypes/ftypesc.json` file with your Salesforce credentials and desired configuration (e.g., Salesforce objects to generate `.ts` files for, output directory).

#### 3. Run the command

```bash
npx ftypes
```

#### 4. Update TypeScript Config (Required if you are using TypeScript LWC Components)

- Update the `tsconfig.json` to include the output folder i.e. `./ftypes` by default to add paths for `@sobject-types`.

```json
{
  "compilerOptions": {
    // ...
    "paths": {
      "@sobject-types/*": ["./.ftypes/typings/*"]
    }
  }
  // ... other config.
}
```

#### 5. Start Using Types - TypeScript (Required if you are using TypeScript LWC Components)

```ts
// 1. -----> import type
import { Account } from '@sobject-types/Index';

import { LightningElement, api } from 'lwc';

export default class TodoItem extends LightningElement {
  // 2. -----> use type
  account: Account = {
    ChildAccounts: [],
    CleanStatus: 'NotFound',
    Type: 'Channel Partner / Reseller',
    Industry: '',
    Ownership: 'Other',
    Rating: 'Cold',
  };
}
```

#### 6. Start Using Types - JavaScript & JSDoc

```js
// 1. -----> Import the type
/**
 * @typedef {import('./.ftypes/typings/Index.ts').Account} Account
 */
import { LightningElement, api } from 'lwc';
export default class TodoItem extends LightningElement {
  // 2. -----> Use the Type
  /**
   * @type Account
   */
  account = {
    ChildAccounts: [],
    CleanStatus: 'NotFound',
    Type: 'Channel Partner / Reseller',
    Industry: '',
    Ownership: 'Other',
    Rating: 'Cold',
  };
}
```

## Usage

### Commands

- `ftypes init` Initialize the ftypes configuration
- `ftypes list` List all sObjects from config file
- `ftypes config` Show config contents
- `ftypes set-target-org <orgname>` Set the default Salesforce organization username in `./ftypes/ftypesc.json`. \*\*This is alias of already authenticated Salesforce org from sf auth
- `ftypes add <objname>` Add type definitions for a specific object
- `ftypes refresh <objname...>` Add type definitions for a specific object(s)
- `ftypes` Generate Typings for all SObjects from config

### Examples

#### 1. Init `ftypes` project with default configuration:

```bash
ftypes init
```

This command creates `.ftypes` file in the current work directory and adds default configuration for types generation

#### 2. Generate `.ts` file for all objects mentioned config:

```bash
ftypes
```

#### 3. Add Object a specific to configuration and generate types:

```bash
ftypes add Account
```

This command adds `Account` object to config list and generates Types for account object

#### 4. Refresh typings of existing Object:

```bash
ftypes refresh Account
```

This command regenerates `Account.ts` in the specified output directory.

### 5. List all configured Salesforce objects:

```bash
ftypes list
```

Lists all Salesforce objects configured in config file(`./ftypes/ftypesc.json`).

#### 6. Set default Salesforce organization username:

```bash
ftypes set-target-org my-sf-org
```

Sets defaultusername in `./ftypes/ftypesc.json` to `my-sf-org` in your sfdx project.

#### 7. Display contents of (`./ftypes/ftypesc.json`):

```bash
ftypes configs
```

Displays the contents of the configuration file (`./ftypes/ftypesc.json`).

More features coming soon...
