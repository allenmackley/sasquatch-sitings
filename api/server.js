const schema      = require('./schema/schema');
const express     = require('express');
const graphqlHTTP = require('express-graphql');
const cors        = require('cors');
const app         = express();
const port        = 3001;
//allow cross-origin requests
app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));
app.listen(port, () => console.log(`Server started on port ${port}`));