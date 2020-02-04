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
      { first_name, last_name, phone_number, email, password },
      { models, secret },
    ) => {

      const User = new Promise(async (resolve, reject) => {
        models.User.create({ first_name, last_name, phone_number, email, password })
        .then(async (user) => {
          resolve(user)
        }).catch(async err => {
          const userExists = await models.User.findByLogin(email)

          if (userExists) {
            reject({ message: new UserInputError('A user already has this email address. Please provide a different email address or login.')})
          }

          reject({ message: err.errors[0].message || new UserInputError("Could not create user. Please check you have provided sufficient information.") })
        })
      })

      const StripeUser = new Promise((resolve, reject) => {
        stripe.accounts.create({ type: 'custom', business_type: 'individual', country: 'AU', email,
          individual: {
            email,
            first_name,
            last_name,
            phone: phone_number,
          },
          requested_capabilities: [
            'card_payments',
            'transfers',
          ],
        }).then(account => resolve(account))
        .catch(err => reject(err))
      })

      return Promise.all([
        User,
        StripeUser,
      ]).then(result => {
        const dbUser = result[0]
        const stripeUser = result[1]

        return { token: createToken(dbUser, secret, '30m') }
      }).catch(({ message }) => { throw new UserInputError(message) })
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
