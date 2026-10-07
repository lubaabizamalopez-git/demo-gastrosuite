const fs = require('fs');

const tsFile = 'c:/02 SISTEMAS/gastrosuite/frontend/src/app/features/personal/personal.component.ts';
let ts = fs.readFileSync(tsFile, 'utf8');

// 1. Fix imports
ts = ts.replace(/import { AlertModalComponent,[\s\n]*GourmetSpinnerComponent } from '\.\.\/\.\.\/shared\/components\/alert-modal\/alert-modal\.component';/g, "import { AlertModalComponent } from '../../shared/components/alert-modal/alert-modal.component';");
ts = ts.replace("import { computed } from '@angular/core';\nexport class PersonalComponent", "export class PersonalComponent");
if (!ts.includes("import { Component, OnInit, signal, inject, computed }")) {
    ts = ts.replace("import { Component, OnInit, signal, inject } from '@angular/core';", "import { Component, OnInit, signal, inject, computed } from '@angular/core';");
}
ts = ts.replace(/AlertModalComponent\n\s*\]/, "AlertModalComponent,\n    GourmetSpinnerComponent\n  ]");

// 2. Fix SelectOption interface in custom-select.component.ts
const selectFile = 'c:/02 SISTEMAS/gastrosuite/frontend/src/app/shared/components/custom-select/custom-select.component.ts';
let selectTs = fs.readFileSync(selectFile, 'utf8');
if (!selectTs.includes('disabled?: boolean;')) {
    selectTs = selectTs.replace('label: string;', 'label: string;\n  disabled?: boolean;');
    fs.writeFileSync(selectFile, selectTs);
}

// 3. Fix comunasOptions declaration
// Find the old array declaration and remove it
ts = ts.replace(/public comunasOptions: SelectOption\[\] = \[\];/g, '');
ts = ts.replace(/this\.comunasOptions = \[\];/g, '');

fs.writeFileSync(tsFile, ts);
console.log('Fixed TS file 2');
