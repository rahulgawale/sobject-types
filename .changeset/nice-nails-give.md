---
"@forcetrails/sobject-types": major
---

# v0.2.0
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

