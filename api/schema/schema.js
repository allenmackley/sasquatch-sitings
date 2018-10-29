const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const typeDefs = `
type Tag {
  id: ID!
  name: String!
}
interface SitingInterface {
  id: ID!
  latitude: Float!
  longitude: Float!
  time: String!
  description: String!
  tags: String
}
type Siting implements SitingInterface {
  id: ID!
  latitude: Float!
  longitude: Float!
  time: String!
  description: String!
  tags: String
}
type RelatedSiting implements SitingInterface {
  id: ID!
  latitude: Float!
  longitude: Float!
  time: String!
  description: String!
  tags: String
  distanceInMeters: Float!
}
type Query {
  siting(id: Int!): Siting,
  allSitings: [Siting!],
  distBetweenSitings(id1: Int!, id2: Int!): Float,
  relatedSitings(
    id: Int!, 
    withinDistanceInMeters: Float!, 
    numClosest: Int, 
    tags: String,
    mustHaveAllTags: Boolean,
    startDate: String,
    endDate: String,
    daysBeforeSiting: Int,
    daysAfterSiting: Int
  ): [RelatedSiting]
}
type Mutation {
  createSiting(
    latitude: Float!
    longitude: Float!
    description: String!
    time: String!
    tags: String!
  ): Siting,
  updateSiting(
    id: Int!
    latitude: Float
    longitude: Float
    description: String
  ): Siting,
  deleteSiting(
    id: Int!
  ): Siting
}
schema {
  query: Query
  mutation: Mutation
}
`;
module.exports = makeExecutableSchema({typeDefs, resolvers});