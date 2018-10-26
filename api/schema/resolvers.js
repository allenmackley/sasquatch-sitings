const pool = require('../db/pool');

module.exports = {
    Query: {
        //return a single siting by sitingId
        siting: async(_, params) => {
            const rows = await pool.query("SELECT * FROM siting WHERE id = ? LIMIT 1;", params.id);
            return rows[0];
        },
        //just return all sitings
        allSitings: async(_, params) => {
            return await pool.query("SELECT * FROM siting;");
        },
        //should take two siting ids and measure the distance
        distBetweenSitings: (_, params) => {
            return 0.000;
        },
        //query sitings related to the id of the one provided using various search params
        relatedSitings: (_, params) => {
            return [];
        }
    },
    Mutation: {
        updateSiting: async(_, params) => {
            const query  = `UPDATE siting SET ? WHERE id = ? LIMIT 1;`;
            const update = await pool.query(query, [params, params.id]);
            let response = null;
            if (update.affectedRows) {
                const select = await pool.query("SELECT * FROM siting WHERE id = ? LIMIT 1;", params.id);
                response = select[0];
            }
            return response;
        }
    }
};