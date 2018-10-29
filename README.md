##Project Notes

####GraphQL:
Because this project uses GraphQL, everything will be accessible through the one, GraphQL endpoint, at `/graphql` and the flexibility for the different CRUD functions will be provided through the GraphQL resolvers.

After following the directions below and starting the server, you can test the GraphQL API using GraphiQL: `http://localhost:3001/graphql`

####TSV Format
Sample Data Format: Tab Separated Values  
The sasquatch-data.tsv file is in the following format:  
Description `\t` Latitude `\t` Longitude `\t` Time `\t` Tags

####MySQL Strategies
Uses MySQL 5.7 `geometry` type and `SPACIAL KEY` indexing.
https://www.youtube.com/watch?v=V8LNyiBACLo

Uses Node MySQL with connection pooling.
https://github.com/mysqljs/mysql

###Technologies Used
* ES6+  
  * Classes
  * Async/Await
  * Arrow functions
  * Promises
* Node.js 
  * csv-streamify  
    * Can handle reading CSV as well as TSV files.
  * express-graphql
    * A wrapper around the popular express library for working with GraphQL.
  * graphql  
    * GraphQL driver for Node.js.
  * graphql-tools  
    * GraphQL tools used for convenience, such as a tool that converts a type definition string into an executable schema.
  * moment  
    * Very popular library that can be used with both client and server-side JavaScript, that is used for converting and formatting date types.
  * nodemon  
    * Automatically restarts the Node server running after file changes, making development faster.
  * mysql  
    * MySQL driver for Node.js.
  * promise-mysql  
      * Extension to the mysql driver for Node that also returns promises. Makes it easier to work with async/await for cleaner and more readable code.
  
* GraphQL  
* MySQL  
  * Geo-spacial functions
  * Spacial Key indexes
  * Connection pooling

##How to test the API
1. Start docker with `docker-compose up`  
2. Open a second terminal  
  a. Enter the bash terminal for the api app.  
  `docker exec -it api bash`  
  b. Run the import script to import stubs  
  `node import`
2. Navigate to `http://localhost:3001/graphql`
3. Enter the queries below  
  a. Ids should be between 1 - 10,000, so if you delete a record, and want to test querying any other records, just use another id anywhere in that range.  
  b. You can play around with the queries, particularly the `relatedSitings` query, and add or remove fields and change their values.

##About sample data/stubs
I've deleted the `import.sh` file and written my own import script so that I could parse and normalize the tags into their own tables.

If I did not do this, each siting would only have its tags in a comma separated list of tags in a TEXT field, in the same format as is provided by the TSV file. If I had done that, to meet the demands of the assessment, I would have had to create SQL queries with several `LIKE` clauses. This would have been ugly, inefficient, and hard to extend. 

It's much better to instead normalize data ahead of time in ways that simplify `SELECT` queries I know I'll need to make, leading to a project that's easier to maintain and that runs much faster.

####Get a single siting
```
{
  siting(id: 1) {
    id
    latitude
    longitude
    time
    description
    tags
  }
}
```

####Create a siting
The create and update methods are kept separate because for a create action, the schema requires non-null params, whereas with an update action, the user can choose to update only one or a few fields.
```
mutation ($lat: Float!, $lon: Float!, $time: String!, $desc: String!, $tags: String!) {
  createSiting(latitude: $lat, longitude: $lon, time: $time, description: $desc, tags: $tags) {
    id,
    latitude,
    longitude,
    time,
    description,
    tags
  }
}
//Sample Query Variables...
{
  "lat": 1.234,
  "lon": 2.567,
  "time": "2018-10-27 21:00:00",
  "desc": "New text",
  "tags": "mountains,brown,frightening"
}

Note that you can write that time in any string format and it will update to the database correctly. 
Before the insert into the database, the time is parsed through the moment.js library.
```

####Update a siting
```
mutation ($id: Int!, $lat: Float, $lon: Float, $desc: String, $tags: String) {
  updateSiting(id: $id, latitude: $lat, longitude: $lon, description: $desc, tags: $tags) {
    id,
    latitude,
    longitude,
    time,
    description,
    tags
  }
}
//Sample Query Variables...
{
  "id": 1,
  "lat": 1.234,
  "lon": 2.567,
  "desc": "New text",
  "tags": "frightening,terrifying"
}
```

####Delete a siting
The delete action will return the id of the deleted field. This is important because the front-end may need the id in order to know what model to delete within a collection in order to update the view. It's best not to delete items from the view until AFTER the backend has actually deleted it.
```
mutation{
  deleteSiting(id: 1){
    id
  }
}
```

####Query all sitings
```
{
  allSitings{
    id
    latitude
    longitude
    time
    description
    tags
  }
}
```

####Query the distance between two sitings
Returns a float.
```
{
  distBetweenSitings(id1: 1, id2: 2)
}
```

####Query related sitings
Everything below `withinDistanceInMeters` is optional and interchangable.

`startDate` and `endDate` are parsed by `moment.js` and so can take multiple string formats.
````
{
  relatedSitings(
    id: 2, 
    withinDistanceInMeters: 50000, 
    numClosest: 100, 
    tags: "mountains,frightening", 
    mustHaveAllTags: true,
    startDate: "July 20, 2018",
    endDate: "2018-07-28",
    daysBeforeSiting: 5,
    daysAfterSiting: 5
  ){
    id
    latitude
    longitude
    time
    description
    tags,
    distanceInMeters
  }
}
````

##Using a Spacial Object for performance
* MySQL 5.7 has the concept of spacial objects. You can see in my `schemadump.sql` file that I've defined a column `geo` as type `geometry`. This is a good idea because it provides the flexibility to store either a point or a geometric shape. MySQL lets us place an index on the point/shape object using `SPACIAL KEY`. This drastically improves lookup performance when querying for spacial data.

##Ways to take it further
* The SQL used in the `relatedSitings` query is quite large. Typically, writing a lot of logic into the SQL is harder to do and to maintain, but is more efficient because we prevent querying any data from the database that we aren't going to deliver to the client, saving memory, and perhaps gaining a speed boost by allowing the MySQL engine to do much of the sorting logic within indexed keys. Whether or not this is actually worth the trade-off for very complicated sorting algorithms in every situation is debatable, as it's much easier to write, update, and test this logic in JavaScript. I think in a production scenario, I would have taken a two-pronged approach, and used MySQL's speed and indexes to query data by the `geometry` type and `SPACIAL_KEY` indexing, (as I've done), however, then used Node.js to handle filtering through dates, etc. However, I've left what I have done in the SQL there due to a time constraint and because it's a great demonstration.
* To make the searching even faster, we could create another table for storing zip code geometries. That would then give us the ability to search for certain sitings within a given zip code, taking full advantage of MySQL's spacial key indexes. We could also draw out custom geometries for our own regions, national parks, specific buildings, and search for all of the sitings within any or several of those shapes.