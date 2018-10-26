
##How to test the API
1. Start docker with `docker-compose up`  
2. Open a second terminal  
  a. Enter the bash for the api app  
  `docker exec -it api bash`
  b. Run the import script to import stubs  
  `node import`
2. Navigate to `http://localhost:3001/graphql`
3. Enter the queries below

##About sample data/stubs
I've deleted the `import.sh` file and written my own import script so that I could parse and normalize the tags into their own tables.

If I did not do this, each siting in the database would contain a comma separated list of tags in a TEXT field, in the same format as is provided by the TSV file. If I had done that, to meet the demands of the assessment, I would have had to create SQL queries with several `LIKE` clauses. This would have been ugly, inefficient, and hard to extend. 

It's much better to instead normalize data ahead of time in ways that simplify `SELECT` queries I know I'll need to make, leading to a project that's easier to maintain and that runs much faster.

####Query a single siting
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
{
  "id": 1,
  "lat": 1.234,
  "lon": 2.567,
  "desc": "New text"
}
```

####Query all sitings
```

```

####Query the distance between two sitings
```

```

####Query related sitings
````

````