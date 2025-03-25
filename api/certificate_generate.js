import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CERTIFICATE_FOLDER = path.join(__dirname, '../assets/certificates');

//base url used for access PDF from local
const BASE_URL = "http://localhost:3000";

// PDF Generator using Puppeteer
/**
 * @Method Method used to convert html content in PDF using by puppeteer NPM
 * @author Neeraj-Mehra
 * @param {*} htmlContent 
 * @returns PDF in buffer formate
 */
const generatePdf = async (htmlContent) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        //set PDF width and height
        const pdfBuffer = await page.pdf({
            width: '260mm',
            height: '150mm',
            printBackground: true,
        });

        //close browser
        await browser.close();
        //return PDF in buffer
        return pdfBuffer;

    } catch (error) {
        console.error('generatePdf : Error generating PDF===>>>', error);
        throw error;
    }
};

/**
 * @Method Method used for generate-certificate using by dynamic data
 * @author Neeraj-Mehra
 * @returns Certificate Url after uploading on local
 */
export const generateCertificate = async (req, res) => {
    try {
        //request body
        const {
            registerId,
            email,
            phone,
            address,
            fullName,
            dob,
            gender,
            bloodGroup,
            dateTime
        } = req.body;

        //certificate html code get 
        const templatePath = path.join(__dirname, 'certificate.html');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(templateContent);

        //made dynamic object for send in certificate creation 
        const data = {
            registerId,
            emailId: email,
            phoneNumber: phone,
            address,
            fullName,
            dateOfBirth: dob,
            gender,
            bloodGroup,
            dateTime
        };

        const html = template(data);

        //call function for convert HTML into PDF buffer
        const pdfBuffer = await generatePdf(html);

        // Ensure folder exists
        if (!fs.existsSync(CERTIFICATE_FOLDER)) {
            fs.mkdirSync(CERTIFICATE_FOLDER, { recursive: true });
        }

        const fileName = `${Date.now()}_certificate.pdf`;
        const pdfPath = path.join(CERTIFICATE_FOLDER, fileName);

        //Save the PDF buffer to file
        fs.writeFileSync(pdfPath, pdfBuffer);

        const fileUrl = `${BASE_URL}/assets/certificates/${fileName}`;

        return res.status(200).send({
            status: 1,
            message: "Certificate generated successfully",
            certificateUrl: fileUrl,
        });

    } catch (error) {
        console.error('generateCertificate Error:', error);
        return res.status(500).send({
            status: 0,
            message: 'Certificate generation failed',
            error: error.message
        });
    }
};
