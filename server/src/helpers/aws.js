const fs = require('fs');
import { config } from '../config';

export const uploadFile = async (bucket, s3, file) => {
  //configuring parameters

  // const formattedFile = new Buffer(file, 'binary')
  console.log("File mAIN: ", file)

  const params = {
    Bucket: config.AWS_S3_BUCKET,
    Body: file,
    Key: 'verification/' + Date.now() + '_' + file.name,
  }

  s3.upload(params, function(err, data) {
    //handle error
    if (err) {
      console.log('Error', err);
    }

    console.log('data', data);

    //success
    if (data) {
      console.log('Uploaded in:', data.Location);
    }
  });
};
