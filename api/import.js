const pool = require('./db/pool');
/*
TODO:
1. Use promise-mysql to simplify code
2. Split functionality into a cleaner object structure
 */

var handleBasicResponse = function(err, result, message = '') {
    if (err) throw err;
    console.log(message, result.message);
};
pool.getConnection((err, conn) => {
    if (err) throw err;
    //Delete old stubs if any exist
    conn.query("DELETE FROM siting;",
        (err, result) => handleBasicResponse(err, result, "Deleted siting"));
    conn.query("DELETE FROM tag;",
        (err, result) => handleBasicResponse(err, result, "Deleted tag"));
    conn.query("DELETE FROM siting_tag;",
        (err, result) => handleBasicResponse(err, result, "Deleted siting_tag"));
    //Load stub data into siting table
    const loadInfile = `
        LOAD DATA LOCAL INFILE './stubs/sasquatch-data.tsv' INTO TABLE siting
        FIELDS TERMINATED BY '\t'
        LINES TERMINATED BY '\n'
        (description, latitude, longitude, time, tags);
    `;
    conn.query(loadInfile, (err, result) => handleBasicResponse(err, result, "Loaded Data"));
    //Now that sitings are loaded into MySQL, select them each
    conn.query("SELECT id, tags FROM siting;", (err, results) => {
        if (err) throw err;
        const sitings = results;
        //Create a list of unique tags, ignoring duplicates
        let tagsList = sitings.reduce((accum, result) => {
            const tags = result.tags.split(',');
            tags.forEach(tag => {
                const tagIsUnique = tag && accum.indexOf(tag) === -1;
                if (tagIsUnique) {
                    accum.push(tag);
                }
            });
            return accum;
        }, []);
        //Wrap each tag in an array so we can insert it below
        tagsList = tagsList.map(tag => [tag]);
        //Insert unique tags into tag table. Table has a unique key on "name", preventing duplicates, so ignore any duplicate errors and only insert unique values.
        conn.query("INSERT IGNORE INTO tag (name) VALUES ?;", [tagsList], (err, result) => handleBasicResponse(err, result, "Inserted tags"));
        //Select our unique tags that were inserted, each now has an id
        conn.query("SELECT * FROM tag;", (err, results) => {
            if (err) throw err;
            // console.log("tags", results);
            const allTags  = results;
            let tagInserts = [];
            //Now that we have tag ids, loop through sitings again and create tag inserts for the many-to-many table with the tag id and siting id for each
            sitings.forEach(result => {
                const sitingId = result.id;
                const tagsArr  = result.tags.split(',');
                tagsArr.forEach(tag => {
                    let tagId;
                    const foundTagObj = allTags.find(tagObj => tagObj.name === tag);
                    if (foundTagObj) {
                        tagId = foundTagObj.id;
                    }
                    if (tagId) {
                        tagInserts.push([sitingId, tagId]);
                    }
                });
            });
            //Insert into the many-to-many table
            conn.query("INSERT INTO siting_tag (siting_id, tag_id) VALUES ?;", [tagInserts], (err, results) => {
                if (err) throw err;
                console.log('tagInsert results', results);
            });
            //Release the connection and close the pool, because we're done with our import script.
            conn.release();
            pool.end((err) => {
                if (err) throw err;
                console.log('Pool closed.')
            });
        });
    });
});


