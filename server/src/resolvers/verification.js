import Sequelize from 'sequelize';
import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from './authorization';
import { uploadFile } from "../helpers/aws"
import { config } from "../config"
import { AWS_S3 } from "../index.mjs"
import fs from "fs"

// const index = require("../index");
const { AWS_S3_ACCESS_KEY_ID, AWS_S3_BUCKET, AWS_S3_SECRET_ACCESS_KEY } = config

export default {
  Mutation: {
    createVerification: combineResolvers(
      isAuthenticated,
      async (parent, { files }, { models, me }) => {
        console.log("files", files)
        const stripe_account = me.account
        const front = files[0]
        const back = files[1]

        let frontS3File
        let backS3File

        try {
          // handle stripe upload
          const frontReader = fs.readFileSync(front)
          const backReader = fs.readFileSync(back)

          const frontDocument = await stripe.files.create({
            purpose: 'identity_document',
            file: {
              data: frontReader,
              name: 'file.jpg',
              type: 'application/octet-stream',
            },
          }, {
            stripe_account,
          })

          const backDocument = await stripe.files.create({
            purpose: 'identity_document',
            file: {
              data: backReader,
              name: 'file2.jpg',
              type: 'application/octet-stream',
            },
          }, {
            stripe_account,
          })

          const updateCustomerWithDocument = await stripe.accounts.update(
            stripe_account,
            {
              verification: {
                document: {
                  front: frontDocument.id,
                  back: backDocument.id,
                },
              },
            }
          );

          // handle AWS S3 upload
          frontS3File = await uploadFile(AWS_S3_BUCKET, AWS_S3, front)
          backS3File = await uploadFile(AWS_S3_BUCKET, AWS_S3, back)

        } catch (e) {
          console.log(e)
        }
        // const s3_upload = ""


        // store file location in verification

        // const fileLocation = s3_upload.link
        // const storeDocumentUrl = await models.Verification.create({
        //   fileLocation,
        //   userId: me.id,
        // });

        return [
          { file_location: "uhsaduasd" },
          { file_location: "sauhdashu" },
        ]
      },
    ),
  },
};
