To import the stub data from sasquatch-data.tsv, first enter the bash for the api app.  
`docker exec -it api bash`

Then run the init script.  
`node stubs/import.js`

I've deleted the `import.sh` file and written my own import script so that I could parse and normalize the tags into their own tables.

If I did not do this, each siting would contain in the database a comma separated list of tags in a TEXT field, in the same format as is provided by the TSV file. If I had done that, to meet the demands of the assessment, I would have had to create SQL queries with several `LIKE` clauses. This would have been ugly, inefficient, and hard to extend. 

It's much better to instead normalize the data ahead of time in ways that simplify `SELECT` queries I know I'll need to make, leading to code that easier to maintain and that runs much faster.

