const pool     = require('./db/pool');
const csv      = require('csv-streamify');
const through2 = require('through2');
const fs       = require('fs');
const SitingInserter = require('./db/SitingInserter');

pool.getConnection().then(async(conn) => {
    const inserter = new SitingInserter(conn);
    await inserter.clearTables();

    const all = [];
    const parser = csv({
        delimiter  : '\t',
        newline    : '\n',
        objectMode : true
    });
    // now pipe some data into it
    fs.createReadStream('./stubs/sasquatch-data.tsv')
        .pipe(parser)
        .pipe(through2.obj(function (chunk, enc, callback) {
            const data = {
                description : chunk[0],
                latitude    : chunk[1],
                longitude   : chunk[2],
                time        : chunk[3],
                tags        : chunk[4]
            };
            this.push(data);
            callback();
        }))
        .on('data', data => all.push(data))
        .on('end', async() => {
            console.log("Processing imports...");
            for (let i = 0; i < all.length; i++) {
                await inserter.insertSiting(all[i]);
            }
            await inserter.insertTagsAll();
            inserter.conn.release();
            console.log('DONE');
            pool.end((err) => {
                if (err) throw err;
                console.log('Pool closed.')
            });
        });
});