import jwt from "jsonwebtoken"
import { combineResolvers } from "graphql-resolvers"
import { AuthenticationError, UserInputError } from "apollo-server"
import { isAdmin, isAuthenticated } from "./authorization"

const stripe = require("stripe")(process.env.STRIPE_KEY)

const createToken = async (user, stripeId, secret, expiresIn) => {
  const { id, email, role } = user
  const account = stripeId
  return await jwt.sign({ id, email, role, account }, secret, { expiresIn })
}

export default {
  Query: {
    users: async (parent, args, { models }) => await models.User.findAll(),
    user: async (parent, { id }, { models }) => await models.User.findByPk(id),
    me: async (parent, args, { models, me }) => {
      if (!me) {
        return null
      }

      return await models.User.findByPk(me.id)
    },
  },

  Mutation: {
    signUp: async (
      parent,
      { first_name, last_name, phone_number, dob, email, password },
      { models, secret, connection }
    ) => {
      const User = new Promise((resolve, reject) => {
        models.User.create({ first_name, last_name, phone_number, dob, email, password })
          .then((user) => {
            resolve(user)
          }).catch(async (err) => {
            const userExists = await models.User.findByLogin(email)
            if (userExists) {
              reject(({ message: new UserInputError("A user already has this email address. Please provide a different email address or login."), rejectType: "user" }))
            } else {
              reject(({ message: err.errors[0].message || new UserInputError("Could not create user. Please check you have provided sufficient information."), rejectType: "user" }))
            }
          })
      })

      const StripeUser = new Promise((resolve, reject) => {
        const day = dob.getUTCDate() + 1
        const month = dob.getUTCMonth()
        const year = dob.getFullYear()

        stripe.accounts.create({
          type: "custom", business_type: "individual", country: "AU", email,
          individual: {
            email,
            first_name,
            dob: {
              day,
              month,
              year,
            },
            last_name,
            phone: phone_number,
            address: {
              city: "Brisbane",
              country: "AU",
              line1: "501 Adelaide Street",
              line2: "4302",
              postal_code: "4000",
              state: "Queensland",
            },
          },
          business_profile: { url: "www.google.com" },
          requested_capabilities: [
            "card_payments",
            "transfers",
          ],
        }).then(account => resolve(account))
          .catch(err => reject({ message: err.raw.message, rejectType: "stripe" }))
      })

      return Promise.all([ // these should only post if both work.
        User,
        StripeUser,
      ]).then(async (result) => {
        const userToStore = result[0].dataValues
        const userId = userToStore.id
        const stripeAccount = result[1]
        const stripeAccountId = stripeAccount.id

        // update model User to account for stripe account
        await models.User.update({ account: stripeAccountId }, { where: { id: userId } })

        await stripe.accounts.update(stripeAccountId, {
          tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: connection.remoteAddress, // Assumes you're not using a proxy
          },
        }
        )

        return { token: createToken(userToStore, stripeAccountId, secret, "60m") }
      }).catch(async ({ message, rejectType }) => {
        switch (rejectType) {
        case "user":
          StripeUser.then((user) => {
            if (user && user.id) {
              stripe.accounts.del(
                user.id,
                function(err, confirmation) {
                  if (confirmation && confirmation.deleted) {
                    console.log("Stripe User deleted successfully")
                  } else if (err) {
                    console.log("Errors: ", err)
                  }
                }
              )
            }
          }).catch(err => err)
          break
        case "stripe":
          User.then((user) => {
            const { id } = user.dataValues
            if (user && id) {
              user.destroy()
            }
          })
          break
        default:
          console.log("Unknown rejectType", rejectType)
          break
        }
        throw new UserInputError(message) })
    },

    signIn: async (
      parent,
      { email, password },
      { models, secret }
    ) => {
      const user = await models.User.findByLogin(email)

      if (!user) {
        throw new UserInputError(
          "No user found with this login credentials."
        )
      }

      const isValid = await user.validatePassword(password)

      if (!isValid) {
        throw new AuthenticationError("Invalid password.")
      }

      return { token: createToken(user, null, secret, "30m") }
    },

    updateUser: combineResolvers(
      isAuthenticated,
      async (parent, { email }, { models, me }) => {
        const user = await models.User.findByPk(me.id)
        return await user.update({ email })
      }
    ),

    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id }, { models }) => await models.User.destroy({ where: { id } })
    ),
  },

  User: {
    invoices: async (user, args, { models }) => await models.Invoice.findAll({ where: { userId: user.id } }),
    verification: async (user, args, { models }) => await models.Verification.findAll({ where: { userId: user.id } }),
  },
}
