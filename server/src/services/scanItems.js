import { DynamoDB } from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();

const scanItems = async () =>
    (await docClient.scan({
        TableName: process.env.TABLE,
        ProjectionExpression: 'id, tabs',
    }).promise()).Items;

export { scanItems };