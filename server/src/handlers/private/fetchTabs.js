import { scanItems } from '../../services/scanItems';
import { success, error } from '../../helpers/general';

module.exports.fetchTabs = async evt => {

    // input validation
    if (evt.queryStringParameters.pass === undefined) {
        return error('Password not included.', 401);
    }

    if (evt.queryStringParameters.pass !== process.env.PASS) {
        return error('Incorrect password.', 401);
    }

    let windows;
    try {
        windows = await scanItems();
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
                    tabs: [tabId1, tabId2]
                },
                {...}
            ]
        },
        {...}
    ]
}
*/