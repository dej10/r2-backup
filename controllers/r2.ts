import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand, ListObjectsV2Command, S3 } from '@aws-sdk/client-s3';
import fs, { unlink } from 'fs';

const r2 = new S3({
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  },
  endpoint: process.env.R2_ENDPOINT!,
  region: 'auto',
  forcePathStyle: false
});

export const uploadR2 = async (bucketName: string, fileName: string, filePath: string) => {
  const fileStream = fs.createReadStream(filePath);

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileStream,
    ContentType: 'application/x-gzip'
  };

  try {
    console.log('Uploading file to R2...');
    const data = await new Upload({
      client: r2,
      params
    }).done();
    console.log(`File uploaded successfully. R2 URL: ${data.Location}`);

    // delete file after uploading to R2
    unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully');
      }
    });
  } catch (error) {
    console.log(`Error uploading: ${error}`);
  } finally {
    fileStream.destroy();
  }
};

export const deleteOldBackups = async () => {
  console.log('Checking for outdated backups...');
  const bucketName = process.env.R2_BUCKET_NAME!;
  const deleteFrequency = process.env.PURGE_BACKUPS_FREQUENCY!;
  const extractedFrequency = extractPartsFromString(deleteFrequency);

  if (!extractedFrequency) {
    console.error('Invalid PURGE_BACKUPS_FREQUENCY format. Expected e.g., 2M, 12D, 1W');
    return;
  }

  const { digits, timePeriod } = extractedFrequency;

  const period = new Date();
  switch (timePeriod) {
    case 'M':
      period.setMonth(period.getMonth() - digits);
      break;
    case 'W':
      period.setDate(period.getDate() - digits * 7);
      break;
    case 'D':
      period.setDate(period.getDate() - digits);
      break;
    default:
      console.error('Unsupported time period');
      return;
  }

  try {
    const listParams = {
      Bucket: bucketName
    };

    const listCommand = new ListObjectsV2Command(listParams);
    const data = await r2.send(listCommand);

    if (data.Contents) {
      for (const object of data.Contents) {
        if (object.LastModified && object.LastModified < period) {
          const deleteParams = {
            Bucket: bucketName,
            Key: object.Key
          };

          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await r2.send(deleteCommand);
          console.log(`Deleted old backup: ${object.Key}`);
        }
      }
    }
    console.log('Cleanup of old backups completed successfully.');
  } catch (error) {
    console.error('Error during cleanup of old backups:', error);
  }
};

const extractPartsFromString = (input: string) => {
  const regex = /^([1-9]\d?)([MDW])$/i;
  const match = input.match(regex);

  if (match) {
    return {
      digits: parseInt(match[1], 10),
      timePeriod: match[2].toUpperCase()
    };
  } else {
    return null; // Invalid input
  }
};
