# @forcetrails/sobject-types

## 1.0.0

### Major Changes

- 8a0610a: This change uses sf cli plugin to run commands and generate types for Salesforce objects.
- 8a0610a: Add command line support to the package. Added commands

  #ftypes
  ftype, with options like, list, config, add, and refresh

- 1d7672e: # v0.2.0
  - Fixed output directory issue.
  - Added init command.
  - Added add command.
  - Added refresh command.
  - Updated config command.
  - Updated list command.
  - Changed config file name to `.ftypesc.json`
  - Changed default configuration
    - Changed output directory to `.ftypes`
    - Added `sfdxDir` with default value `../.sfdx/sfdx-config.json` - looks for sfdx config in cwd
    - Removed `config.json`.
  - Updated `tsconfig.json`.
  - Added initialization checks - `checkInitialization()`.
  - Update readme.md with docs.

### Minor Changes

- c3dde4c: - Added Support for Child Relationships
  - Fixed Picklist Value autocomplete
  - Added Index.ts
  - Added base interface for SObject
  - Fixed code formatting inconsistency
  - Updated Readme.md
