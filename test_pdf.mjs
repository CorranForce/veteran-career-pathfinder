import fs from 'fs';
import pdf from 'pdf-parse';

const pdfFile = '/home/ubuntu/sample_resume_1_army_it.pdf';
const dataBuffer = fs.readFileSync(pdfFile);
const data = await pdf(dataBuffer);

console.log('✓ PDF extraction successful!');
console.log(`Pages: ${data.numpages}`);
console.log(`Text length: ${data.text.length}`);
console.log(`First 500 chars: ${data.text.substring(0, 500)}`);
