import Sequelize from 'sequelize';
import { combineResolvers } from 'graphql-resolvers';

import pubsub, { EVENTS } from '../subscription';
import { isAuthenticated, isInvoiceOwner } from './authorization';

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    invoices: async (parent, { cursor, limit = 100 }, { models }) => {
      const cursorOptions = cursor
        ? {
            where: {
              createdAt: {
                [Sequelize.Op.lt]: fromCursorHash(cursor),
              },
            },
          }
        : {};

      const invoices = await models.Invoice.findAll({
        order: [['createdAt', 'DESC']],
        limit: limit + 1,
        ...cursorOptions,
      });

      const hasNextPage = invoices.length > limit;
      const edges = hasNextPage ? invoices.slice(0, -1) : invoices;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: toCursorHash(
            edges[edges.length - 1].createdAt.toString(),
          ),
        },
      };
    },
    invoice: async (parent, { id }, { models }) => {
      return await models.Invoice.findByPk(id);
    },
  },

  Mutation: {
    createInvoice: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { models, me }) => {
        const invoice = await models.Invoice.create({
          text,
          userId: me.id,
        });

        pubsub.publish(EVENTS.INVOICE.CREATED, {
          InvoiceCreated: { invoice },
        });

        return invoice;
      },
    ),

    deleteInvoice: combineResolvers(
      isAuthenticated,
      isInvoiceOwner,
      async (parent, { id }, { models }) => {
        return await models.Invoice.destroy({ where: { id } });
      },
    ),
  },

  Invoice: {
    user: async (invoice, args, { loaders }) => {
      return await loaders.user.load(invoice.userId);
    },
  },

  Subscription: {
    InvoiceCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.INVOICE.CREATED),
    },
  },
};
