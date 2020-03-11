import { combineResolvers } from "graphql-resolvers"
import { UserInputError } from "apollo-server"
import { S3 } from "../index"
import { formatFileUpload } from "../helpers/universal"
import { isAuthenticated } from "./authorization"

const stripe = require("stripe")(process.env.STRIPE_KEY)

export default {
  Mutation: {
    singleUploadStream: combineResolvers(
      isAuthenticated,
      async (parent, { files }, { models, me }) => {
        const formattedFiles = await files
        // const file = await realFiles[0]

        // const fileToUpload = await stripe.files.create({
        //   purpose: 'identity_document',
        //   file: {
        //     data: file,
        //     name: file.filename,
        //     type: 'image/png', // image/jpeg or image/png
        //   }
        // })

        // console.log("ye", yeet)

        if (formattedFiles.length !== 2) {
          throw new UserInputError("You must upload both front and back verification documents.")
        }

        return Promise.all(
          formattedFiles.map(async (file) => {
            const { createReadStream } = await file // mimetype, filename
            return createReadStream()
          })
        )
          .then(async (res) => {
            const frontFile = res[0]
            const backFile = res[1]
            const frontReadstream = Buffer.from([frontFile.fileStream])
            const backReadstream = Buffer.from([backFile.fileStream])

            return Promise.all([
              stripe.files.create({
                purpose: "identity_document",
                file: {
                  data: frontReadstream,
                  name: "verification_front.png",
                  type: "image/png", // image/jpeg or image/png
                }
              }, { 
                stripeAccount: me.account
              }),
              stripe.files.create({
                purpose: "identity_document",
                file: {
                  data: backReadstream,
                  name: "verification_back.png",
                  type: "image/png",
                }
              }, { 
                stripeAccount: me.account
              }),
            ]).then((documents) => {
              console.log("res:", documents)
              // TODO: Use 'accounts' variable
              // eslint-disable-next-line no-unused-vars
              const accounts = stripe.accounts.update(me.account, { 
                verification: {
                  document: {
                    front: documents[0].id,
                    back: documents[1].id,
                  },
                },
              })

              return [frontFile, backFile]
            }).catch(err => console.log("BIG ERROR: ", err))
          })
          .then(async (files) => {
            if(files.length > 1) {
              const uploadedFiles = files.map(async (file, i) => {
                const formattedKey = i === 0
                  ? formatFileUpload(me.id, "verification_front", "verification_front")
                  : formatFileUpload(me.id, "verification_back", "verification_back")
  
                // Stream to s3
                const uploadParams = { Bucket: process.env.AWS_S3_BUCKET, Key: formattedKey, Body: file.fileStream }
                return await S3.upload(uploadParams).promise()
              })

              const file_location_front = uploadedFiles[0].Location
              const file_location_back = uploadedFiles[1].Location

              return models.Verification.create({
                file_location_front,
                file_location_back,
                userId: me.id,
              })
            } else {
              throw new Error("There was an error posting to Stripe")
            }
          }).catch(err => console.log(err))
      }
    ),

    createVerification: combineResolvers(
      isAuthenticated,
      // TODO: Use 'models', 'me', 'stream' variables
      // eslint-disable-next-line no-unused-vars
      async (parent, { file }, { models, me }) => {
        // eslint-disable-next-line no-unused-vars
        const { stream, filename, mimetype, encoding } = await file

        // Do work 💪

        return { filename, mimetype, encoding, url: "" }
        // const stripe_account = me.account;
        // const front = files[0];
        // const back = files[1];

        // let frontS3File
        // let backS3File

        // try {
        //   // handle stripe upload
        //   const frontReader = fs.readFileSync(front);
        //   const backReader = fs.readFileSync(back);

        //   const frontDocument = await stripe.files.create(
        //     {
        //       purpose: 'identity_document',
        //       file: {
        //         data: frontReader,
        //         name: 'file.jpg',
        //         type: 'application/octet-stream',
        //       },
        //     },
        //     {
        //       stripe_account,
        //     }
        //   );

        //   const backDocument = await stripe.files.create(
        //     {
        //       purpose: 'identity_document',
        //       file: {
        //         data: backReader,
        //         name: 'file2.jpg',
        //         type: 'application/octet-stream',
        //       },
        //     },
        //     {
        //       stripe_account,
        //     }
        //   );

        //   const updateCustomerWithDocument = await stripe.accounts.update(
        //     stripe_account,
        //     {
        //       verification: {
        //         document: {
        //           front: frontDocument.id,
        //           back: backDocument.id,
        //         },
        //       },
        //     }
        //   );

        //   // handle AWS S3 upload
        //   frontS3File = await uploadFile(
        //     AWS_S3_BUCKET,
        //     AWS_S3,
        //     front
        //   );
        //   backS3File = await uploadFile(AWS_S3_BUCKET, AWS_S3, back);
        // } catch (e) {
        //   console.log(e);
        // }
        // // const s3_upload = ""

        // // store file location in verification

        // // const fileLocation = s3_upload.link

        // const file_location_front = "skrt"
        // const file_location_back = "skrt"

        // const verification = await models.Verification.create({
        //   file_location_front,
        //   file_location_back,
        //   userId: me.id,
        // })

        // return verification
      }
    ),

  },

  Verification: { user: async (verification, args, { loaders }) => await loaders.user.load(verification.userId) },
}
