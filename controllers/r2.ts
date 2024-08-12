import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (bucketName: string, key: string, filePath: string) => {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    }
  });

  const fileStream = fs.createReadStream(filePath);

  const input = {
    Bucket: bucketName,
    Key: key,
    ContentType: 'application/x-gzip',
    Body: fileStream,
  }

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