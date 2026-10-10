const fs = require('fs');
let code = fs.readFileSync('src/components/news/NewsCard.tsx', 'utf8');

// Add import if not present
if (!code.includes("import { sfx }")) {
  code = code.replace(
    "import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';",
    "import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';\nimport { sfx } from '../../lib/sound-effects';"
  );
}

// Add to onWheel
if (!code.includes("sfx.toggle();")) {
  code = code.replace(
    "gallery.scrollBy({ left: e.deltaY > 0 ? scrollAmount : -scrollAmount, behavior: 'smooth' });",
    "gallery.scrollBy({ left: e.deltaY > 0 ? scrollAmount : -scrollAmount, behavior: 'smooth' });\n        sfx.toggle();"
  );

  // Add to left button
  code = code.replace(
    "onClick={() => galleryRef.current?.scrollBy({ left: -(galleryRef.current.clientWidth + 16), behavior: 'smooth' })}",
    "onClick={() => { galleryRef.current?.scrollBy({ left: -(galleryRef.current.clientWidth + 16), behavior: 'smooth' }); sfx.toggle(); }}"
  );

  // Add to right button
  code = code.replace(
    "onClick={() => galleryRef.current?.scrollBy({ left: galleryRef.current.clientWidth + 16, behavior: 'smooth' })}",
    "onClick={() => { galleryRef.current?.scrollBy({ left: galleryRef.current.clientWidth + 16, behavior: 'smooth' }); sfx.toggle(); }}"
  );
}

fs.writeFileSync('src/components/news/NewsCard.tsx', code);
console.log('Updated NewsCard.tsx');
