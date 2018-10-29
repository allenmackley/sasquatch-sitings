const SitingProcessor = require('./SitingProcessor');
module.exports = class SitingInserter extends SitingProcessor {
    constructor(conn) {
        super(conn);
    }
    insertSiting(data) {
        const SRID = 4326;
        const insertQuery = `
          INSERT IGNORE INTO siting
          SET latitude    = ?,
              longitude   = ?,
              geo         = ST_GeomFromText(?, ${SRID}),
              time        = ?,
              description = ?,
              tags        = ?;
        `;
        const insertData = [
            data.latitude,
            data.longitude,
            `POINT(${data.longitude} ${data.latitude})`,
            data.time,
            data.description,
            data.tags
        ];
        return this.conn.query(insertQuery, insertData);
    }
    async insertTags(sitings) {
        //Create a list of unique tags, ignoring duplicates
        let tagsList = this.uniqueTagList(sitings);
        tagsList = tagsList.map(tag => [tag]);
        //Insert unique tags into tag table. Table has a unique key on "name", preventing duplicates, so ignore any duplicate errors and only insert unique values.
        await this.conn.query("INSERT IGNORE INTO tag (name) VALUES ?;", [tagsList]);
        console.log("Inserted tags");
        await this.insertTagsJoin(sitings);
    }
    async insertTagsJoin(sitings) {
        //Select our unique tags that were inserted, each now has an id
        const allTags = await this.conn.query("SELECT * FROM tag;");
        //Now that we have tag ids, loop through sitings again and create tag inserts for the many-to-many table with the tag id and siting id for each
        let tagInserts = this.prepareTagInserts(allTags, sitings);
        //Insert into the many-to-many table
        await this.conn.query("INSERT INTO siting_tag (siting_id, tag_id) VALUES ?;", [tagInserts]);
        console.log("Inserted siting_tags");
    }
    async insertTagsFor(siting) {
        await this.insertTags([siting]);
    }
    async insertTagsAll() {
        //Now that sitings are loaded into MySQL, select them each
        const sitings = await this.conn.query("SELECT id, tags FROM siting;");
        await this.insertTags(sitings);
    }
};