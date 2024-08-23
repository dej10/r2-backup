import { Upload } from '@aws-sdk/lib-storage';
import { S3 } from '@aws-sdk/client-s3';
import fs from 'fs';

export const uploadR2 = async (bucketName: string, fileName: string, filePath: string) => {
  const r2 = new S3({
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
    },
    endpoint: process.env.R2_ENDPOINT!,
    region: 'auto',
    forcePathStyle: false,
  });

  const fileStream = fs.createReadStream(filePath);

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileStream,
    ContentType: 'application/x-gzip'
  };

  try {
    const data = await new Upload({
      client: r2,
      params
    }).done();
    console.log(`File uploaded successfully. R2 URL: ${data.Location}`);
  } catch (error) {
    console.log(`Error uploading: ${error}`);
  } finally {
    fileStream.destroy();
  }
};
