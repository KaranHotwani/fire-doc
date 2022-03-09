#! /usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import yargs from "yargs";
import fs from "fs";
const argv = yargs(process.argv.slice(2)).options({
        f:{type:"string",alias:"file",demandOption:true,describe:"firebase_config.json file path"},
        c:{type:"array",alias:"collections",describe:"List of collections for documentation",default:"root"},
        o:{type:"string",alias:"output",describe:"Output format",choices:["csv","json"],default:"csv"}
    }) .argv;
// console.log("Hello world",argv);

// console.log(argv.file);

if(argv.file.length>0)
{
    fs.createReadStream(argv.file).on("data",(bufferData)=>{
        const configFileData = bufferData.toString();
        console.log('fileData',JSON.parse(configFileData).client_email);
    })
}
else
{
    console.log(chalk.bgRed('Invalid File Path'));
}
// fs.createReadStream()
