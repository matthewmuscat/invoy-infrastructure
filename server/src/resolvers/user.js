import jwt from 'jsonwebtoken'
import { combineResolvers } from 'graphql-resolvers'
import { AuthenticationError, UserInputError } from 'apollo-server'
import { config } from "../config"
import { isAdmin, isAuthenticated } from './authorization'

const stripe = require("stripe")(config.STRIPE_KEY)

const createToken = async (user, secret, expiresIn) => {
  const { id, email, role } = user
  return await jwt.sign({ id, email, role }, secret, {
    expiresIn,
  })
}

export default {
  Query: {
    users: async (parent, args, { models }) => {
      return await models.User.findAll()
    },
    user: async (parent, { id }, { models }) => {
      return await models.User.findByPk(id)
    },
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
      { models, secret },
    ) => {

      const User = new Promise(async (resolve, reject) => {
        await models.User.create({ first_name, last_name, phone_number, dob, email, password })
        .then(async (user) => {
          resolve(user)
        }).catch(async err => {
          const userExists = await models.User.findByLogin(email)
          if (userExists) {
            reject(({ message: new UserInputError('A user already has this email address. Please provide a different email address or login.'), rejectType: "user"}))
          } else {
            reject(({ message: err.errors[0].message || new UserInputError("Could not create user. Please check you have provided sufficient information."), rejectType: "user" }))
          }
        })
      })

      const StripeUser = new Promise(async (resolve, reject) => {
        const day = dob.getUTCDate() + 1
        const month = dob.getUTCMonth()
        const year = dob.getFullYear()
        await stripe.accounts.create({ type: 'custom', business_type: 'individual', country: 'AU', email,
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
          business_profile: {
            url: "www.google.com"
          },
          requested_capabilities: [
            'card_payments',
            'transfers',
          ],
        }).then(account => resolve(account))
        .catch(err => reject({message: err.raw.message, rejectType: "stripe"}))
      })

      return Promise.all([ // these should only post if both work.
        User,
        StripeUser,
      ]).then(result => {
        const userToStore = result[0] // sequelize User      
        return { token: createToken(userToStore, secret, '30m') }
      }).catch(async ({ message, rejectType }) => {
        switch (rejectType) {
          case "user":
            StripeUser.then((user) => {
              if (user && user.id) {
                stripe.accounts.del(
                  user.id,
                  function(err, confirmation) {
                    throw new UserInputError("Failed to delete stripe account")
                  }
                )
              }
            }).catch(err => err)
            break;
          case "stripe":
            User.then((user) => {
              const { id } = user.dataValues
                if (user && id) {
                  user.destroy()
                }
            })
            break;
          default:
            console.log("Unknown rejectType", rejectType)
            break;
        }
        throw new UserInputError(message) })
    },

    signIn: async (
      parent,
      { email, password },
      { models, secret },
    ) => {
      const user = await models.User.findByLogin(email)

      if (!user) {
        throw new UserInputError(
          'No user found with this login credentials.',
        )
      }

      const isValid = await user.validatePassword(password)

      if (!isValid) {
        throw new AuthenticationError('Invalid password.')
      }

      return { token: createToken(user, secret, '30m') }
    },

    updateUser: combineResolvers(
      isAuthenticated,
      async (parent, { email }, { models, me }) => {
        const user = await models.User.findByPk(me.id)
        return await user.update({ email })
      },
    ),

    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id }, { models }) => {
        return await models.User.destroy({
          where: { id },
        })
      },
    ),

    // acceptTos: async (
    //   parent,
    //   { email, password },
    //   { models, secret },
    //   ) => {
    //     await stripe.accounts.update(
    //       {{CONNECTED_STRIPE_ACCOUNT_ID}},
    //       {
    //         tos_acceptance: {
    //           date: Math.floor(Date.now() / 1000),
    //           ip: request.connection.remoteAddress // Assumes you're not using a proxy
    //         }
    //       }
    //     );
        




    //   // const user = await models.User.findByLogin(email)

    //   // if (!user) {
    //   //   throw new UserInputError(
    //   //     'No user found with this login credentials.',
    //   //   )
    //   // }

    //   // const isValid = await user.validatePassword(password)

    //   // if (!isValid) {
    //   //   throw new AuthenticationError('Invalid password.')
    //   // }

    //   // return { token: createToken(user, secret, '30m') }
    // }
  },

  User: {
    invoices: async (user, args, { models }) => {
      return await models.Invoice.findAll({
        where: {
          userId: user.id,
        },
      })
    },
  },
}
