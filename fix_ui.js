const fs = require('fs');

const tsFile = 'c:/02 SISTEMAS/gastrosuite/frontend/src/app/features/personal/personal.component.html';
let html = fs.readFileSync(tsFile, 'utf8');

// 1. Fix main spinner
const oldSpinner = `<div class="w-12 h-12 border-4 border-brand-soft border-t-brand-primary rounded-full animate-spin"></div>`;
const newSpinner = `<gs-gourmet-spinner [size]="48" color="brand"></gs-gourmet-spinner>`;
html = html.replace(oldSpinner, newSpinner);

// 2. Fix image section logic
const oldImgLogic = `@if (formEmpleado()?.foto) {`;
const newImgLogic = `@if (formEmpleado()?.foto || formEmpleado()?.imagenUrl) {`;
html = html.replace(oldImgLogic, newImgLogic);

const oldImgSrc = `<img [src]="formEmpleado().foto"`;
const newImgSrc = `<img [src]="formEmpleado().imagenUrl || formEmpleado().foto"`;
html = html.replace(oldImgSrc, newImgSrc);

// 3. Document Select layout & Placeholder encoding fix
// Since the encoding might be weird from the placeholder, I'll just remove the placeholder from the app-custom-select inside document
const oldDoc = `<div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-text-title">Número de documento *</label>
              <div class="flex gap-2 w-full">
                <app-custom-select 
                  class="w-1/3"
                  [options]="docOptions"
                  [ngModel]="formEmpleado().tipoDocumento" 
                  (ngModelChange)="actualizarCampo('tipoDocumento', $event)"
                  placeholder="Seleccionar...">
                </app-custom-select>
                <div class="w-2/3">
                  <input type="text" maxlength="15" [ngModel]="formEmpleado().rut" (ngModelChange)="actualizarCampo('rut', $event)" placeholder="Ej. 12345678-9" class="w-full bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2.5 text-sm text-text-title focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" [ngClass]="{'border-red-500': errores()['rut']}">
                  <p *ngIf="formEmpleado().tipoDocumento === 'RUT'" class="text-[10px] text-text-muted mt-0.5 ml-1">(Sin puntos ni guion)</p>
                </div>
              </div>
              @if(errores()['rut']) { <span class="text-xs text-red-500">{{ errores()['rut'] }}</span> }
            </div>`;
const newDoc = `<div class="flex flex-col gap-1.5 sm:col-span-2">
              <label class="text-xs font-bold text-text-title">Número de documento *</label>
              <div class="grid grid-cols-3 gap-2 w-full">
                <app-custom-select 
                  class="col-span-1"
                  [options]="docOptions"
                  [ngModel]="formEmpleado().tipoDocumento" 
                  (ngModelChange)="actualizarCampo('tipoDocumento', $event)"
                  placeholder="Seleccionar...">
                </app-custom-select>
                <div class="col-span-2">
                  <input type="text" maxlength="15" [ngModel]="formEmpleado().rut" (ngModelChange)="actualizarCampo('rut', $event)" placeholder="Ej. 12345678-9" class="w-full bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2.5 text-sm text-text-title focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" [ngClass]="{'border-red-500': errores()['rut']}">
                  <p *ngIf="formEmpleado().tipoDocumento === 'RUT'" class="text-[10px] text-text-muted mt-0.5 ml-1">(Sin puntos ni guion)</p>
                </div>
              </div>
              @if(errores()['rut']) { <span class="text-xs text-red-500">{{ errores()['rut'] }}</span> }
            </div>`;
if (html.includes(oldDoc)) {
  html = html.replace(oldDoc, newDoc);
} else {
  // Try regex replace to insert sm:col-span-2
  html = html.replace(/<div class="flex flex-col gap-1\.5">\s*<label class="text-xs font-bold text-text-title">Número de documento \*/, '<div class="flex flex-col gap-1.5 sm:col-span-2">\n              <label class="text-xs font-bold text-text-title">Número de documento *');
}

// 4. "el rol pasar abajo" -> by making Document full width (sm:col-span-2), the Rol will automatically drop to the next row!

fs.writeFileSync(tsFile, html);
console.log('HTML UI fixed!');
