const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const typeDefs = `
type Tag {
  id: ID!
  name: String!
}
type Siting {
  id: ID!
  latitude: Float!
  longitude: Float!
  time: String!
  description: String!
  tags: String
}
type Query {
  siting(id: Int!): Siting,
  allSitings: [Siting],
  distBetweenSitings(id1: Int!, id2: Int!): Float,
  relatedSitings(
    id: Int!, 
    distanceInMiles: Float!, 
    numClosest: Int, 
    tags: String,
    mustHaveAllTags: Boolean,
    startDate: String,
    endDate: String,
    dateAfterSiting: String,
    dateBeforeSiting: String
  ): [Siting]
}
type Mutation {
  updateSiting(
    id: Int!
    latitude: Float
    longitude: Float
    description: String
  ): Siting
}
schema {
  query: Query
  mutation: Mutation
}
`;

module.exports = makeExecutableSchema({typeDefs, resolvers});