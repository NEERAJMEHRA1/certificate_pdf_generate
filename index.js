//NPM model
import path from 'path';
import http from "http";
import express from "express";
import { fileURLToPath } from 'url';

//module for used required in ES6
import { createRequire } from "module";
const require = createRequire(import.meta.url);

//express set-up
const app = express();

//parse incoming request in body object formate
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

//swagger set-up
import swaggerUi from "swagger-ui-express";
const swaggerDoc = require("./swagger.json");
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

//import certificate generate API.
import { generateCertificate } from "./api/certificate_generate.js";

//file path and directory path or name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//for showing local certificate pdf in local browser
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const port = 3000;

//Generate-Certificate API routing.
app.post("/certificate-generate", generateCertificate)

//server connection
const server = http.createServer(app).listen(port, () => {
    console.log(`Server running at : http://localhost:${port}`);
});
