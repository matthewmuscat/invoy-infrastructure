export const uploadFile = async (bucket, s3, file) => {
  //configuring parameters

  // const formattedFile = new Buffer(file, 'binary')
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Body: file,
    Key: "verification/" + Date.now() + "_" + file.name,
  }

  s3.upload(params, function(err, data) {
    //handle error
    if (err) {
      console.log("Error", err)
    }

    console.log("data", data)

    //success
    if (data) {
      console.log("Uploaded in:", data.Location)
    }
  })
}

export default null
