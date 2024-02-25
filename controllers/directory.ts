import dotenv from 'dotenv';
import Elysia from "elysia";
import fs from 'fs';
import tar from 'tar';
dotenv.config();

export const dirBackupController = () => {
        const tarFileName = `${process.env.DIR_PWD}_${new Date().toISOString()}.tar.gz`;

        tar.c(
            {
                gzip: true,
                file: tarFileName,
            },
            [process.env.DIR_PWD]
        )
        .then(() => {
            console.log(`Folder ${process.env.DIR_PWD} tarred successfully to ${tarFileName}`);
        })
        .catch((err) => {
            console.error(`Error tarring folder ${process.env.DIR_PWD}: ${err}`);
        });
};
