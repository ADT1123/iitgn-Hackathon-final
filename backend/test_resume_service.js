
const resumeService = require('./src/services/resume.service');
const fs = require('fs');
require('dotenv').config({ path: './.env' }); // Adjust path if needed


async function test() {
    try {
        const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 53 >>\nstream\nBT /F1 24 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000125 00000 n \n0000000215 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n318\n%%EOF');
        const jobDesc = "We need a React developer.";

        console.log('Testing resume analysis...');
        const result = await resumeService.analyzeResume(dummyPdf, jobDesc);
        console.log('SUCCESS:', result);
    } catch (e) {
        console.error('FAILED:', e.message);
        console.error(e.stack);
    }
}

test();
