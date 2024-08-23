import dotenv from 'dotenv';
import { exec } from 'child_process';
import { uploadFile, uploadR2 } from './r2';

import tar from 'tar';
import fs from 'fs';
dotenv.config();

export const dbBackupController = async () => {
  const dbName = process.env.DATABASE_NAME!;
  const bucketName = process.env.R2_BUCKET_NAME!;
  const dumpDirectory = 'dumps';
  // const dumpFileName = `${dumpDirectory}/${dbName}_${new Date().toISOString()}.sql`;

  const dumpFileName = `${dumpDirectory}/${dbName}_${new Date()
    .toISOString()
    .replace(/:/g, '-')}.sql`; // windows cannot process the colon (:) character in the shell do replacing that with hyphen (-)
  const dumpCommand = `mysqldump -u${process.env.DATABASE_USER} -p${process.env.DATABASE_PASSWORD} ${dbName} > ${dumpFileName}`;

  if (!fs.existsSync(dumpDirectory)) {
    fs.mkdirSync(dumpDirectory);
  }

  exec(dumpCommand, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error dumping database: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`mysqldump stderr: ${stderr}`);
    }

    console.log(`Database dumped successfully to ${dumpFileName}`);

    const tarFileName = `${dumpFileName}.tar.gz`;

    await tar.c(
      {
        gzip: true,
        file: tarFileName
      },
      [dumpFileName]
    );

    console.log(`Database dump tarball created at ${tarFileName}`);

    // await uploadFile('db-backups', tarFileName, tarFileName);
    await uploadR2(bucketName, tarFileName, tarFileName);
  });
};
