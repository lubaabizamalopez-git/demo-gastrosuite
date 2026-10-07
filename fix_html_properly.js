const fs = require('fs');

const tsFile = 'c:/02 SISTEMAS/gastrosuite/frontend/src/app/features/personal/personal.component.html';
let html = fs.readFileSync(tsFile, 'utf8');

// 1. Maxlengths
html = html.replace(/<input type="text" \[ngModel\]="formEmpleado\(\)\.nombre"/g, '<input type="text" maxlength="50" [ngModel]="formEmpleado().nombre"');
html = html.replace(/<input type="text" \[ngModel\]="formEmpleado\(\)\.apellidoPaterno"/g, '<input type="text" maxlength="50" [ngModel]="formEmpleado().apellidoPaterno"');
html = html.replace(/<input type="text" \[ngModel\]="formEmpleado\(\)\.apellidoMaterno"/g, '<input type="text" maxlength="50" [ngModel]="formEmpleado().apellidoMaterno"');
html = html.replace(/<input type="text" \[ngModel\]="formEmpleado\(\)\.contactoEmergenciaNombre"/g, '<input type="text" maxlength="50" [ngModel]="formEmpleado().contactoEmergenciaNombre"');
html = html.replace(/<input type="text" \[ngModel\]="formEmpleado\(\)\.direccion"/g, '<input type="text" maxlength="150" [ngModel]="formEmpleado().direccion"');

// 2. Tipo Documento & RUT
const oldDoc = `<select [ngModel]="formEmpleado().tipoDocumento" (ngModelChange)="actualizarCampo('tipoDocumento', $event)" class="w-1/3 bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option value="RUT">RUT</option>
                  <option value="OTRO">Otro</option>
                </select>
                <div class="w-2/3">
                  <input type="text" [ngModel]="formEmpleado().rut" (ngModelChange)="actualizarCampo('rut', $event)" placeholder="Ej. 12345678-9" class="w-full bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2.5 text-sm text-text-title focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" [ngClass]="{'border-red-500': errores()['rut']}">
                </div>`;
const newDoc = `<app-custom-select 
                  class="w-1/3"
                  [options]="docOptions"
                  [ngModel]="formEmpleado().tipoDocumento" 
                  (ngModelChange)="actualizarCampo('tipoDocumento', $event)"
                  placeholder="Seleccionar...">
                </app-custom-select>
                <div class="w-2/3">
                  <input type="text" maxlength="15" [ngModel]="formEmpleado().rut" (ngModelChange)="actualizarCampo('rut', $event)" placeholder="Ej. 12345678-9" class="w-full bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2.5 text-sm text-text-title focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" [ngClass]="{'border-red-500': errores()['rut']}">
                  <p *ngIf="formEmpleado().tipoDocumento === 'RUT'" class="text-[10px] text-text-muted mt-0.5 ml-1">(Sin puntos ni guion)</p>
                </div>`;
html = html.replace(oldDoc, newDoc);

// 3. Move Contacto de Emergencia block to bottom
const emerStart = '<!-- Separador para Contacto y Dirección -->';
const passStart = '<!-- Separador para contraseñas -->';
const saveStart = '<!-- Botones Finales -->'; // Let's see if this exists.
if (html.includes(emerStart) && html.includes(passStart)) {
  const emerBlock = html.substring(html.indexOf(emerStart), html.indexOf(passStart));
  html = html.replace(emerBlock, ''); // Remove it from there
  
  // Find where to put it. Let's place it right before the footer buttons.
  // Look for: <div class="p-6 border-t border-neutral-border bg-brand-cream/30 flex justify-end gap-3 mt-4"> or similar
  const footerStart = '<div class="p-5 border-t border-neutral-border bg-brand-cream flex justify-end gap-3 mt-4">';
  if (html.includes(footerStart)) {
    html = html.replace(footerStart, emerBlock + '\\n            ' + footerStart);
  } else {
    // If not found exactly, just find the end of the form grid
    const endGrid = '</div>\\n\\n        <!-- FOOTER -->'; // just a guess
    // better: search for the end of the form area
    html = html.replace('</form>', emerBlock + '\\n        </form>');
  }
}

// 4. File input styling fix (again)
const oldFile = `class="w-full bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2 text-sm text-text-title outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-soft file:text-brand-primary hover:file:bg-brand-soft/80 cursor-pointer"`;
const newFile = `class="w-full bg-neutral-surface border border-neutral-border rounded-xl px-3 py-2 text-sm text-text-title outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border file:border-brand-primary file:text-sm file:font-bold file:bg-transparent file:text-brand-primary hover:file:bg-brand-soft/10 cursor-pointer"`;
html = html.replace(oldFile, newFile);

fs.writeFileSync(tsFile, html);
console.log('HTML fully patched with node script!');
