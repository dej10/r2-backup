import dotenv from 'dotenv';
import { exec } from 'child_process';
import fs from 'fs';
import tar from 'tar';
dotenv.config();

const moveTar = (tarFileName : string, destinationDir : string) => {
    const mvCommand = `mv ${tarFileName} ${destinationDir}`;
    exec(mvCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error moving file: ${stderr}`);
        } else {
            console.log('File moved successfully');
        }
    });
};

export const dirBackupController = () => {
    const tarFileName = `${process.env.DIR_PWD}_${new Date().toISOString()}.tar.gz`;
    const destinationDir = 'tars/'; // Set your destination directory here

    tar.c(
        {
            gzip: true,
            file: tarFileName,
        },
        [process.env.DIR_PWD]
    )
    .then(() => {
        console.log(`Folder ${process.env.DIR_PWD} tarred successfully to ${tarFileName}`);
        moveTar(tarFileName, destinationDir);
    })
    .catch((err : any) => {
        console.error(`Error tarring folder ${process.env.DIR_PWD}: ${err}`);
    });
};
