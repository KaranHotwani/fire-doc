#! /usr/bin/env node

interface Options {
    f:string,
    file:string,
    c:string[],
    collections:string[],
    o:string
    output:string
}

interface Firebase_Config {
    type:string,
    project_id:string,
    private_key_id:string
    private_key:string 
    client_email:string,
    client_id:string,
    auth_uri: string,
    token_uri: string,
    auth_provider_x509_cert_url:string,
    client_x509_cert_url:string,
  }

import chalk from "chalk";
// import inquirer from "inquirer";
import yargs from "yargs";
import fs from "fs";
import admin from "firebase-admin";
const argv:any = yargs(process.argv.slice(2)).options({
        f:{type:"string",alias:"file",demandOption:true,describe:"firebase_config.json file path"},
        c:{type:"array",alias:"collections",describe:"List of collections for documentation",default:["root"]},
        o:{type:"string",alias:"output",describe:"Output format",choices:["csv","json"],default:"csv"}
    }) .argv;
// console.log("Hello world",argv);

// console.log(argv.file);

if(argv.f.length>0)
{
    fs.createReadStream(argv.f)
    .on("data",async (bufferData)=>{
        const configFileString:string = bufferData.toString();
        const configFileData:Firebase_Config = JSON.parse(configFileString)

        // console.log('fileData',configFileData);
        admin.initializeApp({
            credential:admin.credential.cert(argv.f),
            projectId:configFileData.project_id
        });
        const db:FirebaseFirestore.Firestore = admin.firestore();
        var allPaths:FirebaseFirestore.CollectionReference[] = [];
        await db.listCollections().then(collectionRefs=>collectionRefs.forEach(ref=>{
            allPaths.push(db.collection(ref.id))
        }));
        console.log(allPaths);
        if(allPaths.length===0)
        {
            console.log(chalk.bgRed("No Collections found in firestore"))
            process.exit(1);
        }
        else
        {
            let index:number=0;
            while(allPaths.length!==0)
            {
                const currentPath:FirebaseFirestore.CollectionReference = allPaths[index];
                const qs:FirebaseFirestore.QuerySnapshot = await currentPath.limit(1).get();
                const docData = qs.docs[0].data();
                console.log("dd",docData);
                //document in json or csv this data
            }
        }
        
    })
    .on("error",(e)=>{
        console.log(chalk.bgRed(e));
        process.exit(1);
    })



}
else
{
    console.log(chalk.bgRed('Invalid File Path'));
    process.exit(1);
}
// fs.createReadStream()
