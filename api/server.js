// const schema      = require('./schema/schema');
const express     = require('express');
// import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server';
// const graphqlHTTP = require('express-graphql');
// const cors        = require('cors');

var app = express();
//allow cross-origin requests
// app.use(cors());
//
// app.use('/graphql', graphqlHTTP({
//     schema,
//     graphiql: true
// }));

const port = 3001;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

module.exports = app;