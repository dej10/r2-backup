import dotenv from 'dotenv';
import Elysia from "elysia";
const { exec } = require('child_process');
import fs from 'fs';
dotenv.config()



export const dbBackupController = () => {
    const dbName = process.env.DATABASE_NAME;
    const dumpDirectory = 'dumps';
    const dumpFileName = `${dumpDirectory}/${dbName}_${new Date().toISOString()}.sql`;

   const dumpCommand = `mysqldump -u${process.env.DATABASE_USER} -p${process.env.DATABASE_PASSWORD} ${dbName} > ${dumpFileName} `;


    if (!fs.existsSync(dumpDirectory)) {
            fs.mkdirSync(dumpDirectory);
        }


    exec(dumpCommand, (error, stdout, stderr) => {
      console.log('dumping')
        if (error) {
            console.error(`Error dumping database: ${error.message}`);
            return;
        }
        // TODO fix mysqldump stderr: mysqldump: [Warning] Using a password on the command line interface can be insecure.
        if (stderr) {
            console.error(`mysqldump stderr: ${stderr}`);
            return;
        }
        console.log(`Database dumped successfully to ${dumpFileName}`);
        // send to r2

  }
    )}
