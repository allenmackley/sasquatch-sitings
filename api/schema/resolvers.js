const pool   = require('../db/pool');
const moment = require('moment');
//Any common methods can be put here to keep my code as DRY as possible.
const common = {
    querySiting: async(id) => {
        return await pool.query("SELECT * FROM siting WHERE id = ? LIMIT 1;", id)[0];
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
            return await pool.query("SELECT * FROM siting;");
        },
        //should take two siting ids and measure the distance
        distBetweenSitings: async(_, params) => {
            const distanceQuery = `
                SELECT ST_Distance_Sphere(
                    POINT(s1.longitude, s1.latitude),
                    POINT(s2.longitude, s2.latitude)
                ) AS distInMeters
                FROM siting AS s1
                JOIN siting AS s2 ON s2.id = ?
                WHERE s1.id = ? 
                LIMIT 1;
            `;
            const results = await pool.query(distanceQuery, [params.id1, params.id2]);
            return results[0].distInMeters;
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
                  ST_Distance_Sphere(
                    POINT(sRelated.longitude, sRelated.latitude),
                    POINT(sPrimary.longitude, sPrimary.latitude)
                  ) AS distanceInMeters,
                  (
                    SELECT 
                    GROUP_CONCAT(tSub.name)
                    FROM siting AS sSub
                    JOIN siting_tag AS stSub ON sSub.id = stSub.siting_id
                    JOIN tag AS tSub ON stSub.tag_id = tSub.id
                    WHERE sSub.id = sRelated.id
                  ) AS tags
                FROM siting AS sRelated
                JOIN siting AS sPrimary ON sPrimary.id = :id
                JOIN siting_tag AS sTag ON sRelated.id = sTag.siting_id
                JOIN tag ON sTag.tag_id = tag.id
                WHERE ST_Distance_Sphere(
                  POINT(sRelated.longitude, sRelated.latitude),
                  POINT(sPrimary.longitude, sPrimary.latitude)
                ) <= :withinDistanceInMeters 
                AND sRelated.id != sPrimary.id
                AND (:ignoreTags OR tag.name IN(:tags))
                AND (
                    (
                     sRelated.time >= :startDate
                      AND 
                     sRelated.time <= :endDate
                    )
                  AND 
                    (
                      :ignoreDateRangeFromPrimary
                      OR 
                      (sRelated.time >= DATE_SUB(sPrimary.time, INTERVAL :daysBeforeSiting DAY)
                        AND sRelated.time <= sPrimary.time)
                      OR
                      (sRelated.time <= DATE_ADD(sPrimary.time, INTERVAL :daysAfterSiting DAY)
                        AND sRelated.time >= sPrimary.time)
                    )
                )
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
            params.time = moment(params.time).toDate();
            const query = `INSERT INTO siting SET ?;`;
            const insert = await pool.query(query, params);
            return insert.insertId ? common.querySiting(insert.insertId) : null;
        },
        updateSiting: async(_, params) => {
            params.time = moment(params.time).toDate();
            const query  = `UPDATE siting SET ? WHERE id = ? LIMIT 1;`;
            const update = await pool.query(query, [params, params.id]);
            return update.affectedRows ? common.querySiting(params.id) : null;
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