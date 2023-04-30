import { batchGetItems } from '../../services/batchGetItems';
import { success, error } from '../../helpers/general';

module.exports.fetchGroups = async evt => {
    
    // input validation
    if (evt.queryStringParameters.windows === undefined) {
        return error(`The 'windows' key is missing. Make sure the data is structured correctly. Received input: ${JSON.stringify(evt.queryStringParameters, null, 2)}`, 400);
    }

    const ids = JSON.parse(evt.queryStringParameters.windows);

    let windows;
    try {
        windows = await batchGetItems(ids);
    } catch (err) {
        console.error(`ERROR while getting windows: ${err.name}: ${err.message}`);
        return error('Something went wrong. Please try again or contact support.', 500);
    }

    return success(windows);
};

/*
Request structure:
{
    windows: [id1, id2, id3]
}

Response structure:
{
    windows: [
        {
            id,
            lastUpdated: 482739234,
            groups: [
                {
                    name: "History",
                    color: "#8B8000",
                    tabs: [tabId1, tabId2]
                },
                {...}
            ]
        },
        {...}
    ]
}
*/