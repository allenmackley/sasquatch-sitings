const SitingProcessor = require('./SitingProcessor');
const SitingInserter  = require('./SitingInserter');
module.exports = class SitingUpdater extends SitingProcessor {
    constructor(conn) {
        super(conn);
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
    async updateTags(sitings) {
        for (let i = 0; i < sitings.length; i++) {
            const siting = sitings[i];
            await this.conn.query("DELETE FROM siting_tag WHERE siting_id = ?;", siting.id);
        }
        const inserter = new SitingInserter(this.conn);
        await inserter.insertTags(sitings);
    }
    async updateTagsFor(siting) {
        await this.updateTags([siting]);
    }
};