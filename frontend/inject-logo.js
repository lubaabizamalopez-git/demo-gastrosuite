const fs = require('fs');
const file = 'C:/02 SISTEMAS/gastrosuite/frontend/src/app/shared/index-shared/index-shared.component.html';
let content = fs.readFileSync(file, 'utf8');

const svgLogo = `
  <div class="flex flex-col gap-4 p-6 bg-[#231E1B] rounded-2xl border border-[#FFBD80]/20 mb-8">
    <h2 class="text-white text-lg font-bold">Logo SVG Generado</h2>
    <div class="flex items-center gap-6">
      <!-- Solo gorro -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
        <path d="M6 16.5C3 16.5 2 13 4.5 11C4 7 7 4 12 4C17 4 20 7 19.5 11C22 13 21 16.5 18 16.5" />
        <rect x="6" y="16.5" width="12" height="4.5" rx="1.5" />
        <line x1="6" y1="16.5" x2="18" y2="16.5" />
      </svg>
      
      <!-- Gorro + Texto -->
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12">
          <path d="M6 16.5C3 16.5 2 13 4.5 11C4 7 7 4 12 4C17 4 20 7 19.5 11C22 13 21 16.5 18 16.5" />
          <rect x="6" y="16.5" width="12" height="4.5" rx="1.5" />
          <line x1="6" y1="16.5" x2="18" y2="16.5" />
        </svg>
        <span class="text-white font-sans text-3xl font-extrabold tracking-tight">
          Gastro<span class="text-[#FF6B00]">Suite</span>
        </span>
      </div>
    </div>
  </div>
`;

content = content.replace('</app-view-header>', '</app-view-header>\n' + svgLogo);
fs.writeFileSync(file, content);
