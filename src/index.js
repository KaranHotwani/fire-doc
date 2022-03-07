#! /usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import yargs from "yargs";

const argv = yargs(process.argv.slice(2)).options({
        f:{type:"string",alias:"file",demandOption:true,describe:"firebase_config.json file"},
        c:{type:"array",alias:"collections",describe:"List of collections for documentation",default:"root"},
        o:{type:"string",alias:"output",describe:"Output format",choices:["csv","json"],default:"csv"}
    }) .argv;
console.log("Hello world",argv);

// const usage = "Firebase Documentation tool fire-doc";
// const argv = yargs.options({
//     f:{type:"file",alias:"file",demandOption:true}
// }).argv;
