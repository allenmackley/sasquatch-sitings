module.exports = class SasquatchImporter {
    constructor(conn) {
        this.conn = conn;
        this.env  = process.env.NODE_ENV;
    }
    async clearTables() {
        if (this.env === 'development') {
            //Delete old stubs if any exist
            await this.conn.query("DELETE FROM siting;");
            await this.conn.query("ALTER TABLE siting AUTO_INCREMENT = 1;");
            console.log('Deleted siting');
            await this.conn.query("DELETE FROM tag;");
            await this.conn.query("ALTER TABLE tag AUTO_INCREMENT = 1;");
            console.log('Deleted tag');
            await this.conn.query("DELETE FROM siting_tag;");
            await this.conn.query("ALTER TABLE siting_tag AUTO_INCREMENT = 1;");
            console.log('Deleted siting_tag');
        }
    }
    updateSiting(data) {
        const SRID  = 4326;
        const query = `
          UPDATE siting
          SET latitude    = ?,
              longitude   = ?,
              geo         = ST_GeomFromText(?, ${SRID}),
              time        = ?,
              description = ?,
              tags        = ?
          WHERE id = ? 
          LIMIT 1;
        `;
        const updateData = [
            data.latitude,
            data.longitude,
            `POINT(${data.longitude} ${data.latitude})`,
            data.time,
            data.description,
            data.tags,
            data.id
        ];
        return this.conn.query(query, updateData);
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
    uniqueTagList(sitings) {
        return sitings.reduce((accum, result) => {
            const tags = result.tags.split(',');
            tags.forEach(tag => {
                const tagIsUnique = tag && accum.indexOf(tag) === -1;
                if (tagIsUnique) {
                    accum.push(tag);
                }
            });
            return accum;
        }, []);
    }
    prepareTagInserts(allTags, sitings) {
        let tagInserts = [];
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
        return tagInserts;
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
    async updateTags(sitings) {
        for (let i = 0; i < sitings.length; i++) {
            const siting = sitings[i];
            await this.conn.query("DELETE FROM siting_tag WHERE siting_id = ?;", siting.id);
        }
        await this.insertTags(sitings);
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
    async updateTagsFor(siting) {
        await this.updateTags([siting]);
    }
}