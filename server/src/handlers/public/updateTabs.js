import { updateItem } from '../../services/updateItem';
import { parseRequest, success, error } from '../../helpers/general';

module.exports.updateTabs = async evt => {
    const req = parseRequest(evt);

    // input validation
    if (req.windows === undefined) {
        return error(`The 'windows' key is missing. Make sure the data is structured correctly. Received input: ${JSON.stringify(req, null, 2)}`, 400);
    }

    // update windows
    const now = Date.now();
    try {
        await Promise.all(
            req.windows.map(win => updateItem(
                win.id,
                {
                    tabs: win.tabs,
                    lastUpdated: now,
                    groups: null,
                })),
        );
    } catch (err) {
        console.error(`ERROR while updating windows: ${err.name}: ${err.message}`);
        return error(`Updating windows failed. ${err.name}: ${err.message}`, 500);
    }

    return success('success');
};

/*
structure

Windows:
[
    {
        id,
        tabs: {
            ...
        }
    }
]
*/