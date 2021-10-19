# Linnify Angular Schematics

This package will provide custom Angular Schematics for your project, based on the Linnify Styleguide.

### Installing

```bash
  npm i @linnify/angular-schematics --save-dev
```

### Quick Start

After you install the package, you need to add the following entry in the `angular.json` file. This is how the project will know to use the Linnify Schematics Collection instead of the default Angular one.

```bash
  "cli": {
    "defaultCollection": "@linnify/angular-schematics"
  }
```

