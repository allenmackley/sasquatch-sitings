const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');

const typeDefs = `

`;

module.exports = makeExecutableSchema({typeDefs, resolvers});