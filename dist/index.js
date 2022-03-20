#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const figlet = require("figlet");
const chalk_1 = __importDefault(require("chalk"));
// import inquirer from "inquirer";
const yargs_1 = __importDefault(require("yargs"));
const fs_1 = __importDefault(require("fs"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const csv_writer_1 = require("csv-writer");
const nanospinner_1 = require("nanospinner");
const spinner = (0, nanospinner_1.createSpinner)('Test');
figlet.text("FIRE DOC", { horizontalLayout: "full", verticalLayout: "fitted" }, (err, data) => {
    if (err) {
        console.log(err);
    }
    console.log(data);
    console.time("TimeLapsed");
    const argv = (0, yargs_1.default)(process.argv.slice(2)).options({
        f: { type: "string", alias: "file", demandOption: true, describe: "firebase config file path" },
        c: { type: "array", alias: "collections", describe: "List of collections", default: ["root"] },
        o: { type: "string", alias: "output", describe: "Output format", choices: ["csv"], default: "csv" }
        // o:{type:"string",alias:"output",describe:"Output format",choices:["csv","json"],default:"csv"}
    }).argv;
    // console.log("Hello world",argv);
    spinner.start({ text: 'processing ...', color: 'blue' });
    if (argv.f.length > 0) {
        fs_1.default.createReadStream(argv.f)
            .on("data", (bufferData) => __awaiter(void 0, void 0, void 0, function* () {
            const configFileString = bufferData.toString();
            const configFileData = JSON.parse(configFileString);
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(argv.f),
                projectId: configFileData.project_id
            });
            const db = firebase_admin_1.default.firestore();
            var allPaths = [];
            if (argv.c.length === 1 && argv.c[0] === "root") {
                yield db.listCollections().then(collectionRefs => collectionRefs.forEach(ref => {
                    allPaths.push(db.collection(ref.id));
                }));
                if (allPaths.length === 0) {
                    spinner.error({ text: chalk_1.default.red("No Collections found in firestore"), mark: chalk_1.default.red(':(') });
                    process.exit(1);
                }
                else {
                    let index = 0;
                    var records = [];
                    while (allPaths.length !== 0) {
                        const currentPath = allPaths[index];
                        const qs = yield currentPath.limit(1).get();
                        const docData = qs.docs[0].data();
                        const schema = getSchema(docData);
                        records.push({ schema: schema, path: qs.docs[0].ref.path });
                        allPaths.splice(index, 1);
                        let subCollections = yield qs.docs[0].ref.listCollections();
                        subCollections.forEach(subCollection => {
                            allPaths.push(subCollection);
                        });
                    }
                    records.sort((a, b) => (a.path > b.path) ? 1 : ((b.path > a.path) ? -1 : 0));
                    yield writeDoc(records);
                    console.log('\n');
                    console.timeEnd("TimeLapsed");
                    spinner.success({ text: chalk_1.default.blue(`Documentation Successful!\n Find shema at ${process.cwd()}/firebase_schema.csv`), mark: chalk_1.default.yellow(':)') });
                }
            }
            else {
                spinner.error({
                    text: chalk_1.default.red(`Documenting specific collections is not supported yet.Please use default option 'root' for now.`),
                    mark: chalk_1.default.red(':(')
                });
                process.exit(1);
            }
        }))
            .on("error", (e) => {
            spinner.error({ text: chalk_1.default.red(e.toString()), mark: chalk_1.default.red(':(') });
            process.exit(1);
        });
    }
    else {
        spinner.error({ text: chalk_1.default.bgRed('Invalid File Path'), mark: chalk_1.default.red(':(') });
        process.exit(1);
    }
});
function writeDoc(records) {
    return __awaiter(this, void 0, void 0, function* () {
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: `./firebase_schema.csv`,
            header: [
                { id: 'path', title: 'PATH' },
                { id: 'schema', title: 'SCHEMA' }
            ]
        });
        yield csvWriter.writeRecords(records);
    });
}
function getSchema(docData) {
    var schema = {};
    for (let key in docData) {
        if (Array.isArray(docData[key])) {
            schema[key] = "array";
        }
        else if (docData[key] === null) {
            schema[key] = null;
        }
        else if (typeof docData[key] === "object") {
            if ((docData[key].hasOwnProperty("seconds") || docData[key].hasOwnProperty("_seconds"))
                && (docData[key].hasOwnProperty("nanoseconds") || docData[key].hasOwnProperty("_nanoseconds"))) {
                schema[key] = "timestamp";
            }
            else if (docData[key].hasOwnProperty("_latitude") && docData[key].hasOwnProperty("_longitude")) {
                schema[key] = "geopoint";
            }
            else if (docData[key].path !== undefined) {
                schema[key] = "reference";
            }
            else
                schema[key] = "map";
        }
        else {
            schema[key] = typeof docData[key];
        }
    }
    return JSON.stringify(schema);
}
