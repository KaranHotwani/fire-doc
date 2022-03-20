## FIRE DOC
Fire-doc is a simple script written in Typescript that runs over your entire cloud firestore database
and gives out the a csv file as an output containing a documentation of all the firestore documents in all
the collections in your database. 

## Getting Started

## Prerequisites
node.js v14+, npm

## Installation
npm install @karanh15/fire-doc

## Available Options
```
Options:
      --help         Show help                                         
      --version      Show version number                               
  -f, --file         firebase config file path(required)
  -c, --collections  List of collections(Unavailable for now)        
  -o, --output       Output format(Unavailable for now)
 ```

## Examples

```
fire-doc -f /home/uname/Desktop/src/testProj-firebase-adminsdk-ry873-98g90byb01.json 
```

## Description

This tool is written to help with a problem that arises when using cloud firestore. As you might know 
when you use firestore, there is no schema at all!! since it is a nosql database. But other nosql databases
(e.g mongodb) does give you option to design your schema and then use it while doing crud operations in your
database. Since schemas are not required and is not mandatory when it comes to firestore(IDK why?), it may happen
that you have a bunch of collections and nested collections in your database with firestore documents containing 
objects with different fields having different datatypes. So as you can see it can get messy and there is no
way of just documenting it. This tool tries to solve that issue. It will select a firestore document from each collection
and give you the fields stored in it with it's datatype and path to the document so you can know where & what is
stored in your db.

Do share any doubts,queries,feedbacks etc.
I faced this issue while working on firestore where I had to sit and document everything and it was a painful process.
So I automated it and thought it may help others who might face the same issue.

Create a firebase project and Go to Project Settings > Service Accounts > Create Service Account and download 
serviceAccountKey.json. This file is required to give access to your database for documentation. The Output
will be saved in local file system, in the directory from which script has run.


## Upcoming features.
- Documentation for selected collections.
- Documenting till a certain nesting level.
- Output in Json format.
- Documentation for multiple documents inside each collection.
- Documentation for nested objects.
- Firebase emulator suite support.
- Not a feature, but testing & profiling is pending too.

## Authors
- Karan Hotwani - https://www.linkedin.com/in/karan-hotwani-a9ba73167

Cheers!