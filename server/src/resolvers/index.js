import { GraphQLDateTime } from 'graphql-iso-date';

import userResolvers from './user';
import invoiceResolvers from './invoice';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  userResolvers,
  invoiceResolvers,
];
