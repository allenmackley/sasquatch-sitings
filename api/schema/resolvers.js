const pool   = require('../db/pool');
const moment = require('moment');
const SasquatchImporter = require('../db/SasquatchImporter');
//Any common methods can be put here to keep my code as DRY as possible.
const common = {
    querySiting: async(id) => {
        const query = `
          SELECT siting.*, GROUP_CONCAT(tag.name) AS tags
          FROM siting
          JOIN siting_tag ON siting.id = siting_tag.siting_id
          JOIN tag ON siting_tag.tag_id = tag.id
          WHERE siting.id = ? 
          LIMIT 1
        `;
        const rows = await pool.query(query, id);
        return rows[0];
    },
    useBoundPropNames: function(query, values) {
        if (!values) return query;
        return query.replace(/\:(\w+)/g, function (txt, key) {
            if (values.hasOwnProperty(key)) {
                return this.escape(values[key]);
            }
            return txt;
        }.bind(this));
    }
};
module.exports = {
    Query: {
        //return a single siting by sitingId
        siting: async(_, params) => {
            return common.querySiting(params.id);
        },
        //just return all sitings
        allSitings: async(_, params) => {
            const query = `
              SELECT siting.*,
                (SELECT
                 GROUP_CONCAT(tSub.name)
                 FROM siting AS sSub
                 JOIN siting_tag AS stSub ON sSub.id = stSub.siting_id
                 JOIN tag AS tSub ON stSub.tag_id = tSub.id
                 WHERE sSub.id = siting.id
                 ) AS tags
              FROM siting;
            `;
            return await pool.query(query);
        },
        //should take two siting ids and measure the distance
        distBetweenSitings: async(_, params) => {
            console.log('params', params);
            const distanceQuery = `
                SELECT ST_Distance_Sphere(s1.geo, s2.geo) AS distInMeters
                FROM siting AS s1
                JOIN siting AS s2 ON s2.id = ?
                WHERE s1.id = ? 
                LIMIT 1;
            `;
            const results = await pool.query(distanceQuery, [params.id1, params.id2]);
            console.log('results', results);
            return results ? results[0].distInMeters : [];
        },
        //query sitings related to the id of the one provided using various search params
        relatedSitings: async(_, params) => {
            //This is the SRID used by Google Maps, which will help ensure good compatibility.
            const SRID = 4326;
            //Makes the LIMIT an option without needing to break up the query or add a conditional statement
            const numClosest = params.numClosest || 1000000;
            const id = params.id;
            const withinDistanceInMeters = params.withinDistanceInMeters;
            let tags = false;
            let numRequiredTags = 1;
            let ignoreTags = true;
            let ignoreDateRangeFromPrimary = true;
            if (params.tags) {
                tags = params.tags.split(/,\s*/);
                //Removes any whitespace tags
                const cleanTags = tags.filter(el => el);
                ignoreTags = ! cleanTags.length;
            }
            if (params.mustHaveAllTags) {
                numRequiredTags = tags.length;
            }
            let startDate = params.startDate || '1970-01-01 00:00:00';
            startDate     = moment(startDate).format('YYYY/MM/DD HH:mm:ss');
            let endDate   = params.endDate ? moment(params.endDate) : moment();
            endDate       = endDate.format('YYYY/MM/DD HH:mm:ss');
            const daysBeforeSiting = params.daysBeforeSiting || 0;
            const daysAfterSiting  = params.daysAfterSiting || 0;
            if (daysBeforeSiting || daysAfterSiting) {
                ignoreDateRangeFromPrimary = false;
            }
            const searchQuery = `
                SELECT 
                  sRelated.id,
                  sRelated.latitude,
                  sRelated.longitude,
                  DATE_FORMAT(sRelated.time, '%Y-%m-%d %h:%m:%s') AS time,
                  sRelated.description,
                  ST_Distance_Sphere(sRelated.geo, sPrimary.geo) AS distanceInMeters,
                  # The subquery gives us a comma-separated list of all tags for each siting search result 
                  (
                    SELECT 
                    GROUP_CONCAT(tSub.name)
                    FROM siting AS sSub
                    JOIN siting_tag AS stSub ON sSub.id = stSub.siting_id
                    JOIN tag AS tSub ON stSub.tag_id = tSub.id
                    WHERE sSub.id = sRelated.id
                  ) AS tags
                FROM siting AS sRelated
                # The primary id becomes the base by which we search for related results
                JOIN siting AS sPrimary ON sPrimary.id = :id
                # We JOIN on the tags again here because we can't GROUP_CONCAT the tags and use them individually for filters at the same time
                JOIN siting_tag AS sTag ON sRelated.id = sTag.siting_id
                JOIN tag ON sTag.tag_id = tag.id
                WHERE ST_Distance_Sphere(sRelated.geo, sPrimary.geo) <= :withinDistanceInMeters 
                AND sRelated.id != sPrimary.id
                AND (:ignoreTags OR tag.name IN(:tags))
                # This AND will always evaluate to TRUE because if the startDate isn't provided in the params, it is default to the Unix Epoch at the start of the method, and if end date is not provided, it is defaulted to NOW.
                AND (
                    # Either we don't care about the range from the primary siting, or we do, in which case, we can include days before the siting, days after the siting, or both.
                    (
                      :ignoreDateRangeFromPrimary
                      OR 
                      (sRelated.time >= DATE_SUB(sPrimary.time, INTERVAL :daysBeforeSiting DAY)
                        AND sRelated.time <= sPrimary.time)
                      OR
                      (sRelated.time <= DATE_ADD(sPrimary.time, INTERVAL :daysAfterSiting DAY)
                        AND sRelated.time >= sPrimary.time)
                    )
                  AND
                    # If start and end date are included with the above, will further restrict the range. However, if only date range below included, query will work regardless. 
                    (
                      sRelated.time >= :startDate
                        AND
                      sRelated.time <= :endDate
                    )
                )
                # The GROUP BY and HAVING allow us to require a specific number of tags. I've set the logic above the SQL to either require one tag (if any tags provided) or all tags.
                GROUP BY sRelated.id
                HAVING count(*) = :numRequiredTags
                ORDER BY distanceInMeters
                LIMIT :numClosest;
            `;
            const poolConn = await pool.getConnection();
            poolConn.connection.config.queryFormat = common.useBoundPropNames;
            return await poolConn.query(searchQuery, {
                id,
                withinDistanceInMeters,
                ignoreTags,
                tags,
                startDate,
                endDate,
                ignoreDateRangeFromPrimary,
                daysBeforeSiting,
                daysAfterSiting,
                numRequiredTags,
                numClosest
            });
        }
    },
    Mutation: {
        createSiting: async(_, params) => {
            params.time    = moment(params.time).toDate();
            const conn     = await pool.getConnection();
            const importer = new SasquatchImporter(conn);
            const insert   = await importer.insertSiting(params);
            const insertId = insert.insertId;
            let siting     = null;
            if (insertId) {
                siting = await common.querySiting(insertId);
                siting.tags = params.tags;
                await importer.insertTagsFor(siting);
            }
            return siting;
        },
        updateSiting: async(_, params) => {
            params.time    = moment(params.time).toDate();
            const conn     = await pool.getConnection();
            const importer = new SasquatchImporter(conn);
            const update   = await importer.updateSiting(params);
            let siting     = null;
            if (update.affectedRows) {
                siting = await common.querySiting(params.id);
                siting.tags = params.tags;
                console.log('updateSiting', siting);
                await importer.updateTagsFor(siting);
            }
            return siting;
        },
        deleteSiting: async(_, params) => {
            const result = await pool.query("DELETE FROM siting WHERE id = ? LIMIT 1;", params.id);
            console.log('result', result);
            let id = "Couldn't find record. Siting may already be deleted.";
            if (result.affectedRows) {id = params.id;}
            return {id};
        }
    }
};