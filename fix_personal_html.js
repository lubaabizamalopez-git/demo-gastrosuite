const fs = require('fs');
const htmlFile = 'c:/02 SISTEMAS/gastrosuite/frontend/src/app/features/personal/personal.component.html';
let html = fs.readFileSync(htmlFile, 'utf8');

// 1. gap-4 -> gap-6 in grid
html = html.replace('grid grid-cols-1 sm:grid-cols-2 gap-4', 'grid grid-cols-1 sm:grid-cols-2 gap-6');

// 2. Add maxlength to string inputs
html = html.replace(/<app-form-input \s*label="Nombres"/g, '<app-form-input label="Nombres" [maxlength]="50"');
html = html.replace(/<app-form-input \s*label="Apellido Paterno"/g, '<app-form-input label="Apellido Paterno" [maxlength]="50"');
html = html.replace(/<app-form-input \s*label="Apellido Materno"/g, '<app-form-input label="Apellido Materno" [maxlength]="50"');
html = html.replace(/<app-form-input \s*label="Nombre de Contacto"/g, '<app-form-input label="Nombre de Contacto" [maxlength]="50"');
// Wait, app-form-input might not support [maxlength]. I'll pass maxlength="50" directly without brackets if it's passed as attribute.
html = html.replace(/\[maxlength\]/g, 'maxlength');

// 3. Document Select
const oldDoc = `<div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-text-title">Tipo de Documento</label>
              <select [ngModel]="formEmpleado().tipoDocumento" (ngModelChange)="actualizarCampo('tipoDocumento', $event)" class="w-full bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2.5 text-sm text-text-title focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all">
                <option value="RUT">RUT</option>
                <option value="PASAPORTE">Pasaporte / Otro</option>
              </select>
            </div>`;
const newDoc = `<div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-text-title">Tipo de Documento</label>
              <app-custom-select 
                [options]="docOptions" 
                [ngModel]="formEmpleado().tipoDocumento" 
                (ngModelChange)="actualizarCampo('tipoDocumento', $event)" 
                placeholder="Seleccionar...">
              </app-custom-select>
            </div>`;
html = html.replace(oldDoc, newDoc);

// 4. RUT instructions
const rutInputStr = `(ngModelChange)="actualizarCampo('rut', $event)" [error]="errores()['rut']"></app-form-input>`;
if (!html.includes('Sin puntos ni guion')) {
  html = html.replace(rutInputStr, rutInputStr + `\n              <p *ngIf="formEmpleado().tipoDocumento === 'RUT'" class="text-[10px] text-text-muted mt-0.5 ml-1">(Sin puntos ni guion)</p>`);
}

// 5. Replace Region, Ciudad, Comuna selects with app-custom-select
const oldRegion = `<select [ngModel]="formEmpleado().regionId" (ngModelChange)="onRegionChange($event)" class="w-full bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2.5 text-sm text-text-title focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all">
                <option [ngValue]="null">Seleccione Región</option>
                @for (r of regiones(); track r.id) {
                  <option [ngValue]="r.id">{{r.nombre}}</option>
                }
              </select>`;
const newRegion = `<label class="text-xs font-bold text-text-title">Región</label>
              <app-custom-select 
                [options]="regionesSelectOptions()" 
                [ngModel]="formEmpleado().regionId" 
                (ngModelChange)="onRegionChange($event)" 
                placeholder="Seleccionar...">
              </app-custom-select>`;
html = html.replace(oldRegion, newRegion);

const oldCiudad = `<select [ngModel]="formEmpleado().ciudadId" (ngModelChange)="onCiudadChange($event)" [disabled]="!formEmpleado().regionId" class="w-full bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2.5 text-sm text-text-title focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all disabled:opacity-50">
                <option [ngValue]="null">Seleccione Ciudad</option>
                @for (c of ciudades(); track c.id) {
                  <option [ngValue]="c.id">{{c.nombre}}</option>
                }
              </select>`;
const newCiudad = `<label class="text-xs font-bold text-text-title">Ciudad</label>
              <app-custom-select 
                [options]="ciudadesOptions()" 
                [ngModel]="formEmpleado().ciudadId" 
                (ngModelChange)="onCiudadChange($event)" 
                [disabled]="!formEmpleado().regionId"
                placeholder="Seleccionar...">
              </app-custom-select>`;
html = html.replace(oldCiudad, newCiudad);

const oldComuna = `<select [ngModel]="formEmpleado().comunaId" (ngModelChange)="actualizarCampo('comunaId', $event)" [disabled]="!formEmpleado().ciudadId" class="w-full bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2.5 text-sm text-text-title focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all disabled:opacity-50">
                <option [ngValue]="null">Seleccione Comuna</option>
                @for (c of comunas(); track c.id) {
                  <option [ngValue]="c.id">{{c.nombre}}</option>
                }
              </select>`;
const newComuna = `<label class="text-xs font-bold text-text-title">Comuna</label>
              <app-custom-select 
                [options]="comunasOptions()" 
                [ngModel]="formEmpleado().comunaId" 
                (ngModelChange)="actualizarCampo('comunaId', $event)" 
                [disabled]="!formEmpleado().ciudadId"
                placeholder="Seleccionar...">
              </app-custom-select>`;
html = html.replace(oldComuna, newComuna);

// 6. Spinner
const oldGuardarBtn = `<app-button type="button" variant="primary" (click)="ejecutarAccion('guardar')" [disabled]="guardando()">
            <div class="flex items-center gap-2">
              <i *ngIf="guardando()" class="fa-solid fa-spinner fa-spin"></i>
              <i *ngIf="!guardando()" class="fa-solid fa-save"></i>
              {{ guardando() ? 'Guardando...' : 'Guardar' }}
            </div>
          </app-button>`;
const newGuardarBtn = `<app-button type="button" variant="primary" (click)="ejecutarAccion('guardar')" [disabled]="guardando()">
            <div class="flex items-center gap-2">
              <gs-gourmet-spinner *ngIf="guardando()" [size]="20" color="white"></gs-gourmet-spinner>
              <i *ngIf="!guardando()" class="fa-solid fa-save"></i>
              {{ guardando() ? 'Guardando...' : 'Guardar' }}
            </div>
          </app-button>`;
html = html.replace(oldGuardarBtn, newGuardarBtn);

// 7. Extract Emergency Contact block and move to bottom
const emerStart = '<!-- Sección Contacto de Emergencia -->';
const emerEndIndex = html.indexOf('<!-- Controles de Acceso (Credenciales) -->');
if (emerEndIndex !== -1 && html.includes(emerStart)) {
  const emerStartIndex = html.indexOf(emerStart);
  const emerBlock = html.substring(emerStartIndex, emerEndIndex);
  html = html.replace(emerBlock, ''); // Remove it from there
  
  // Find where to place it (after credentials)
  const formEnd = '</form>';
  html = html.replace(formEnd, emerBlock + '\n          ' + formEnd);
}

// 8. File upload button design
// Old button: class="bg-indigo-600 hover:bg-indigo-700 text-white..." (probably something jarring like this)
// I will just replace the native input overlay styles to match the brand.
const fileLabelRegex = /<label for="fotoInput".*?>\s*Seleccionar archivo\s*<\/label>/;
const newFileLabel = `<label for="fotoInput" class="cursor-pointer bg-neutral-surface border border-neutral-border text-text-title px-4 py-2 rounded-xl hover:bg-neutral-background hover:border-brand-primary hover:text-brand-primary transition-all text-sm font-semibold flex items-center gap-2">
                      <i class="fa-solid fa-upload"></i> Subir Foto
                    </label>`;
if (html.match(fileLabelRegex)) {
   html = html.replace(fileLabelRegex, newFileLabel);
} else {
   // Maybe it was different
   const fallbackRegex = /<label for="fotoInput"[^>]*>[\s\S]*?<\/label>/;
   html = html.replace(fallbackRegex, newFileLabel);
}

fs.writeFileSync(htmlFile, html);
console.log('HTML updated completely');
