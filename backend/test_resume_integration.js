
const resumeService = require('./src/services/resume.service');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
require('dotenv').config({ path: './.env' });

async function createValidPdf() {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 30;

    page.drawText('This is a test resume.', {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0.53, 0.71),
    });

    page.drawText('Experience: React Developer. Skills: JavaScript, Node.js.', {
        x: 50,
        y: height - 6 * fontSize,
        size: 12,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

async function test() {
    try {
        const pdfBuffer = await createValidPdf();
        console.log('Created valid PDF buffer of size:', pdfBuffer.length);

        const jobDesc = "We need a React developer.";

        console.log('Testing resume analysis...');
        const result = await resumeService.analyzeResume(pdfBuffer, jobDesc);
        console.log('SUCCESS:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('FAILED:', e.message);
        if (e.message.includes('PDF')) {
            console.error('Logic: PDF Parsing failed.');
        } else if (e.message.includes('Gemini')) {
            console.error('Logic: Gemini API failed.');
        }
        console.error(e.stack);
    }
}

test();
