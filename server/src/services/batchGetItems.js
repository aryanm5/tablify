import { DynamoDB } from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();

const table = process.env.TABLE;

const batchGetItems = async ids => {
    if (ids.length === 0) { //batchGet throws error for empty array
        return [];
    }
    const queryParams = {
        RequestItems: {
            [table]: {
                Keys: ids.map(id => ({ id }))
            }
        }
    };

    return (await docClient.batchGet(queryParams).promise()).Responses[table];
};

export { batchGetItems };