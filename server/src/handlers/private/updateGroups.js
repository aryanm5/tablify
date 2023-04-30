import { updateItem } from '../../services/updateItem';
import { parseRequest, success, error } from '../../helpers/general';

module.exports.updateGroups = async evt => {
    const req = parseRequest(evt);

    // input validation
    if (req.pass === undefined) {
        return error('Password not included.', 401);
    }

    if (req.pass !== process.env.PASS) {
        return error('Incorrect password.', 401);
    }

    if (req.windows === undefined) {
        return error(`The 'windows' key is missing. Make sure the data is structured correctly. Received input: ${JSON.stringify(req, null, 2)}`, 400);
    }

    // update windows
    try {
        await Promise.all(
            req.windows.map(win => updateItem(
                win.id,
                {
                    groups: win.groups,
                },
                true
            )),
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
        groups: {
            ...
        }
    }
]
*/