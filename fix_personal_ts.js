const fs = require('fs');

const tsFile = 'c:/02 SISTEMAS/gastrosuite/frontend/src/app/features/personal/personal.component.ts';
let ts = fs.readFileSync(tsFile, 'utf8');

// 1. Better error messages using backend responses
ts = ts.replace("mensaje: 'No se pudo crear. Verifica correo o documento.'", "mensaje: err?.error?.message || 'No se pudo crear. Verifica el correo o número de documento / RUT.'");
ts = ts.replace("mensaje: 'No se pudo actualizar la ficha.'", "mensaje: err?.error?.message || 'No se pudo actualizar la ficha.'");

// 2. Prepare custom-select options for geography
const newCiudadesOptions = `  public ciudadesOptions = computed(() => {
    return [{ value: null, label: 'Seleccionar...', disabled: true }, ...this.ciudades().map(c => ({ value: c.id, label: c.nombre }))];
  });`;
const newComunasOptions = `  public comunasOptions = computed(() => {
    return [{ value: null, label: 'Seleccionar...', disabled: true }, ...this.comunas().map(c => ({ value: c.id, label: c.nombre }))];
  });`;
const newRegionesOptions = `  public regionesSelectOptions = computed(() => {
    return [{ value: null, label: 'Seleccionar...', disabled: true }, ...this.regiones().map(r => ({ value: r.id, label: r.nombre }))];
  });`;

if (!ts.includes('ciudadesOptions = computed')) {
    ts = ts.replace('export class PersonalComponent implements OnInit {', "import { computed } from '@angular/core';\nexport class PersonalComponent implements OnInit {");
    ts = ts.replace('public formEmpleado = signal<any>(null);', 'public formEmpleado = signal<any>(null);\n' + newCiudadesOptions + '\n' + newComunasOptions + '\n' + newRegionesOptions);
}

// Ensure the standard options also have "Seleccionar..."
const rolesOptionsFix = `  public rolesOptions: SelectOption[] = [
    { value: null, label: 'Seleccionar...', disabled: true },
    { value: 'MESERO', label: 'MESERO' },
    { value: 'CAJERO', label: 'CAJERO' },
    { value: 'SUPERADMIN', label: 'SUPERADMIN' }
  ];`;
ts = ts.replace(/public rolesOptions: SelectOption\[\] = \[.*?\];/s, rolesOptionsFix);

const docOptionsFix = `  public docOptions: SelectOption[] = [
    { value: null, label: 'Seleccionar...', disabled: true },
    { value: 'RUT', label: 'RUT' },
    { value: 'PASAPORTE', label: 'Pasaporte / Otro' }
  ];`;
if (!ts.includes('docOptions')) {
  ts = ts.replace('public rolesOptions:', docOptionsFix + '\n\n  public rolesOptions:');
}

// Add GourmetSpinnerComponent to imports
if (!ts.includes('GourmetSpinnerComponent')) {
  ts = ts.replace(/import { GeografiaService } from '..\/..\/core\/services\/geografia.service';/, "import { GeografiaService } from '../../core/services/geografia.service';\nimport { GourmetSpinnerComponent } from '../../shared/components/gourmet-spinner/gourmet-spinner.component';");
  ts = ts.replace('AlertModalComponent', 'AlertModalComponent,\n    GourmetSpinnerComponent');
}

// Rut parsing for save
const rutLogic = `
    if (payload.tipoDocumento === 'RUT' && payload.rut) {
      let rutLimpio = payload.rut.replace(/[^0-9kK]/g, '');
      payload.dv = rutLimpio.slice(-1).toUpperCase();
      payload.rut = rutLimpio.slice(0, -1);
    } else {
      payload.dv = 'NULL';
    }
`;
if (!ts.includes('payload.dv = rutLimpio.slice(-1).toUpperCase();')) {
  ts = ts.replace(/if \(form\.imagenUrl && form\.imagenUrl\.trim\(\) !== ''\) \{/, rutLogic + "\n    if (form.imagenUrl && form.imagenUrl.trim() !== '') {");
}

fs.writeFileSync(tsFile, ts);
console.log('TS updated');
