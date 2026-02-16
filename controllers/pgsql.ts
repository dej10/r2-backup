import dotenv from 'dotenv';
import { exec } from 'child_process';
import { uploadR2 } from './r2';

import tar from 'tar';
import fs, { unlink } from 'fs';

dotenv.config();

export const pgsqlBackupController = async () => {
  const dbName = process.env.DATABASE_NAME!;
  const dbUser = process.env.DATABASE_USER!;
  const dbPassword = process.env.DATABASE_PASSWORD!;
  const dbHost = process.env.DATABASE_HOST || 'localhost';
  const dbPort = process.env.DATABASE_PORT || '5432';
  const bucketName = process.env.R2_BUCKET_NAME!;
  const dumpDirectory = 'dumps';

  const dumpFileName = `${dumpDirectory}/${dbName}_${new Date()
    .toISOString()
    .replace(/:/g, '-')}.sql`;
  const dumpCommand = `PGPASSWORD=${dbPassword} pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} ${dbName} > ${dumpFileName}`;

  if (!fs.existsSync(dumpDirectory)) {
    fs.mkdirSync(dumpDirectory);
  }

  exec(dumpCommand, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error dumping PostgreSQL database: ${error.message}`);
      return false;
    }

    if (stderr) {
      console.error(`pg_dump stderr: ${stderr}`);
    }

    console.log(`PostgreSQL database dumped successfully to ${dumpFileName}`);

    const tarFileName = `${dumpFileName}.tar.gz`;

    console.log(`Creating tarball of database dump at ${tarFileName}`);
    await tar.c(
      {
        gzip: true,
        file: tarFileName
      },
      [dumpFileName]
    );

    unlink(dumpFileName, (err) => {
      if (err) {
        console.error(`Error deleting ${dumpFileName}:`, err);
      } else {
        console.log(`Dump ${dumpFileName} deleted successfully`);
      }
    });

    console.log(`PostgreSQL dump tarball created at ${tarFileName}`);

    await uploadR2(bucketName, tarFileName, tarFileName);
  });
};
