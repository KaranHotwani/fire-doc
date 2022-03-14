#! /usr/bin/env node
import figlet = require("figlet");
import chalk from "chalk";
// import inquirer from "inquirer";
import yargs from "yargs";
import fs from "fs";
import admin from "firebase-admin";
import { createObjectCsvWriter } from "csv-writer";
import { createSpinner } from "nanospinner";

const spinner = createSpinner('Test');
interface Options {
    f: string,
    file: string,
    c: string[],
    collections: string[],
    o: string
    output: string
}

interface Firebase_Config {
    type: string,
    project_id: string,
    private_key_id: string
    private_key: string
    client_email: string,
    client_id: string,
    auth_uri: string,
    token_uri: string,
    auth_provider_x509_cert_url: string,
    client_x509_cert_url: string,
}

interface CsvRecord {
    path: string,
    schema: string
}

figlet.text("FIRE DOC", {horizontalLayout:"full",verticalLayout:"fitted"},(err: any, data: any) => {
    if (err) {
        console.log(err);
    }
    console.log(data);
    const argv: any = yargs(process.argv.slice(2)).options({
        f: { type: "string", alias: "file", demandOption: true, describe: "firebase config file path" },
        c: { type: "array", alias: "collections", describe: "List of collections", default: ["root"] },
        o: { type: "string", alias: "output", describe: "Output format", choices: ["csv"], default: "csv" }
        // o:{type:"string",alias:"output",describe:"Output format",choices:["csv","json"],default:"csv"}
    }).argv;
    // console.log("Hello world",argv);

    // console.log(argv.file);
    spinner.start({ text: 'processing ...', color: 'blue' });
    if (argv.f.length > 0) {
        fs.createReadStream(argv.f)
            .on("data", async (bufferData) => {
                const configFileString: string = bufferData.toString();
                const configFileData: Firebase_Config = JSON.parse(configFileString)

                // console.log('fileData',configFileData);
                admin.initializeApp({
                    credential: admin.credential.cert(argv.f),
                    projectId: configFileData.project_id
                });
                const db: FirebaseFirestore.Firestore = admin.firestore();
                var allPaths: FirebaseFirestore.CollectionReference[] = [];
                if (argv.c.length === 1 && argv.c[0] === "root") {
                    await db.listCollections().then(collectionRefs => collectionRefs.forEach(ref => {
                        allPaths.push(db.collection(ref.id))
                    }));
                    // console.log(allPaths);
                    if (allPaths.length === 0) {
                        // console.log(chalk.bgRed("No Collections found in firestore"))
                        spinner.error({ text: chalk.red("No Collections found in firestore"), mark: chalk.red(':(') });
                        process.exit(1);
                    }
                    else {
                        let index: number = 0;
                        var records: CsvRecord[] = [];
                        while (allPaths.length !== 0) {
                            const currentPath: FirebaseFirestore.CollectionReference = allPaths[index];
                            const qs: FirebaseFirestore.QuerySnapshot = await currentPath.limit(1).get();
                            const docData: FirebaseFirestore.DocumentData = qs.docs[0].data();
                            // console.log("dd",docData);
                            //document in json & csv this data
                            // await writeDoc(docData,qs.docs[0].ref.path)
                            const schema = getSchema(docData);
                            records.push({ schema: schema, path: qs.docs[0].ref.path });
                            allPaths.splice(index, 1);
                            let subCollections: FirebaseFirestore.CollectionReference[] = await qs.docs[0].ref.listCollections();
                            subCollections.forEach(subCollection => {
                                allPaths.push(subCollection)
                            })
                        }
                        // console.log(records);
                        records.sort((a, b) => (a.path > b.path) ? 1 : ((b.path > a.path) ? -1 : 0))
                        await writeDoc(records);
                        spinner.success({ text: chalk.blue(`Documentation Successful!\n Find shema at ${__dirname}/firebase_schema.csv`), mark: chalk.yellow(':)') })
                    }
                }
                else {
                    spinner.error(
                        {
                            text: chalk.red(`Documenting specific collections is not supported yet.Please use default option 'root' for now.`),
                            mark: chalk.red(':(')
                        });
                    process.exit(1);
                }
            })
            .on("error", (e) => {
                // console.log(chalk.bgRed(e));
                spinner.error({ text: chalk.red(e.toString()), mark: chalk.red(':(') });
                process.exit(1);
            })



    }
    else {
        // console.log(chalk.bgRed('Invalid File Path'));
        spinner.error({ text: chalk.bgRed('Invalid File Path'), mark: chalk.red(':(') });
        process.exit(1);
    }
})



async function writeDoc(records: CsvRecord[]) {
    // console.log("128",records);

    const csvWriter = createObjectCsvWriter({
        path: `${__dirname}/firebase_schema.csv`,
        header: [
            { id: 'path', title: 'PATH' },
            { id: 'schema', title: 'SCHEMA' }
        ]
    })
    await csvWriter.writeRecords(records)

}

function getSchema(docData: admin.firestore.DocumentData) {
    var schema: any = {};
    for (let key in docData) {
        if (Array.isArray(docData[key])) {
            schema[key] = "array";
        }
        else {
            schema[key] = typeof docData[key];
        }

    }
    return JSON.stringify(schema);
}

//firebase data types string, number,boolean,map,array,null,timestamp,geopoint,reference