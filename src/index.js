import http from "http"
import cors from "cors"
import morgan from "morgan"
import jwt from "jsonwebtoken"
import DataLoader from "dataloader"
import express from "express"
import {
  ApolloServer,
  AuthenticationError,
} from "apollo-server-express"

import schema from "./schema"
import resolvers from "./resolvers"
import models, { sequelize } from "./models"
import loaders from "./loaders"

require("dotenv").config()

const app = express()
const AWS_SDK = require("aws-sdk")

// Configure AWS
AWS_SDK.config.update({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  destinationBucketName: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_S3_REGION,
})

export const AWS = AWS_SDK
export const S3 = new AWS.S3()

app.use(cors())
app.use(morgan("dev"))

const getMe = async (req) => {
  const token = req.headers["x-token"]

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET)
    } catch (e) {
      throw new AuthenticationError(
        "Your session expired. Sign in again.",
      )
    }
  }
}

const server = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs: schema,
  resolvers,
  formatError: (error) => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace("SequelizeValidationError: ", "")
      .replace("Validation error: ", "")

    return {
      ...error,
      message,
    }
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        },
      }
    }

    if (req) {
      const me = await getMe(req)

      return {
        models,
        me,
        secret: process.env.SECRET,
        connection: req.connection,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        },
      }
    }
  },
})

server.applyMiddleware({ app, path: "/graphql" })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

const isTest = !!process.env.TEST_DATABASE
const isProduction = !!process.env.DATABASE_URL
const port = process.env.PORT || 8000
const flag = true

sequelize.sync({ force: isTest || isProduction || flag }).then(async () => {
  // TODO: define createUsersWithInvoices properly
  const createUsersWithInvoices = () => null
  if (isTest || isProduction) { createUsersWithInvoices(new Date()) }

  httpServer.listen({ port }, () => { console.log(`Apollo Server on http://localhost:${port}/graphql`) })
})