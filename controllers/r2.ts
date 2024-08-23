import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from 'aws-sdk';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (bucketName: string, key: string, filePath: string) => {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!
    }
  });

  const fileStream = fs.createReadStream(filePath);

  const input = {
    Bucket: bucketName,
    Key: key,
    ContentType: 'application/x-gzip',
    Body: fileStream
  };

  try {
    console.log('Sending upload command');
    const result = await client.send(new PutObjectCommand(input));
    console.log('File uploaded successfully', result);
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    fileStream.destroy(); // Close the file stream
  }
};

export const uploadR2 = async (bucketName: string, fileName: string, filePath: string) => {
  const r2 = new S3({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    endpoint: process.env.R2_ENDPOINT!,
    region: 'auto',
    s3ForcePathStyle: false,
    signatureVersion: 'v4'
  });

  const fileStream = fs.createReadStream(filePath);

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileStream,
    ContentType: 'application/x-gzip'
  };

  try {
    const data = await r2.upload(params).promise();
    console.log(`File uploaded successfully. R2 URL: ${data.Location}`);
  } catch (error) {
    console.log(`Error uploading: ${error}`);
  } finally {
    fileStream.destroy();
  }
};
