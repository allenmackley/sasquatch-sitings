module.exports = {
    Query: {
        //return a single siting by sitingId
        siting: (_, params) => {
            return '';
        },
        //just return all sitings
        allSitings: (_, params) => {

        },
        //should take two siting ids and measure the distance
        distanceBetweenSitings: (_, params) => {

        },
        /*
          * Should take:
          *     Int sitingId
          *     Float distanceInMiles
          *     Int numClosest (optional)
          *     Object tagsObject (optional)
          *     Object dateObject (optional)
          * Should use the distance to determine the geofence, then query for all sitings within that geofence
          * If numClosest is provided, it should filter out the results of the geofence only by X number of the most closest
          * tagsObject: {
          *     tags: [...],
          *     requireAll: true|false
          * }
          * dateObject: {
          *     startDate: '...',
          *     endDate: '...',
          *     after: '...', //optional, use moment.js
          *     before: '...' //optional, use moment.js
          * }
         */
        relatedSitings: (_, params) => {

        }
    },
    Mutation: {
        //update a single siting (location or description)
        updateSiting: (_, params) => {
            return '';
        },
        //update siting tags (receive new list of tags, and add or remove as necessary)
        updateSitingTags: (_, params) => {

        }
    }
};