import { DynamoDB } from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();

const table = process.env.TABLE;

const batchGetItems = async ids => { //[id, id]
    if (ids.length === 0) { //batchGet throws error for empty array
        return [];
    }

    const chunked = sliceIntoChunks(ids, 100);
    const queries = [];

    for (let i = 0; i < chunked.length; ++i) {
        const params = {
            RequestItems: {
                [table]: {
                    Keys: chunked[i].map(id => ({ id })),
                    ProjectionExpression: 'id, groups, lastUpdated',
                },
            }
        };

        queries.push(docClient.batchGet(params).promise());
    }

    const results = (await Promise.all(queries)).map(query => query.Responses[table]).flat();

    return results;
};

function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

export { batchGetItems };