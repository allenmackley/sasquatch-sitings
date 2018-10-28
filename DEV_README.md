
##How to test the API
1. Start docker with `docker-compose up`  
2. Open a second terminal  
  a. Enter the bash for the api app  
  `docker exec -it api bash`
  b. Run the import script to import stubs  
  `node import`
2. Navigate to `http://localhost:3001/graphql`
3. Enter the queries below  
  a. Ids should be between 1 - 10,000, so if you delete a record, and want to test querying any other records, just use another id antwhere in that range.

##About sample data/stubs
I've deleted the `import.sh` file and written my own import script so that I could parse and normalize the tags into their own tables.

If I did not do this, each siting in the database would contain a comma separated list of tags in a TEXT field, in the same format as is provided by the TSV file. If I had done that, to meet the demands of the assessment, I would have had to create SQL queries with several `LIKE` clauses. This would have been ugly, inefficient, and hard to extend. 

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
mutation ($id: Int!, $lat: Float, $lon: Float, $desc: String) {
  updateSiting(id: $id, latitude: $lat, longitude: $lon, description: $desc) {
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
  "desc": "New text"
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
```
{
  distBetweenSitings(id1: 1, id2: 2){
    
  }
}
```

####Query related sitings
````
{
  relatedSitings(
    id: 2, 
    distanceInMeters: 5000000, 
    numClosest: 100, 
    tags: "black,frightening,huge,mountains", 
    mustHaveAllTags: true
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
* MySQL 5.7 has the concept of spacial objects. You can see in my `schemadump.sql` file that I've define a column `geo` as type `geometry`. This is a good idea because it provides the flexibility to store either a point or a geometric shape. MySQL lets us place an index on the point/shape object using `SPACIAL KEY`. This drastically improve lookup performance when querying for spacial data.

##Ways to improve further
* MySQL 5.7 supports the `geo` type. This special type can be either a point or a shape and can have a special `SPACIAL KEY` index placed on it. This index can greatly improve MySQL performance.
* MySQL 8 has some additional geo capabilities as well.