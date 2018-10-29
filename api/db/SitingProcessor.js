module.exports = class SitingProcessor {
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
};