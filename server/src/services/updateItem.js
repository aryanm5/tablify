import { DynamoDB } from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();

const table = process.env.TABLE;

const updateItem = async (id, info, group = false) => {
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};
    let updateExpression = 'set ';
    Object.keys(info).forEach(key => {
        if (info[key] !== undefined) {
            expressionAttributeNames['#' + key] = key;
            updateExpression += `#${key} = :${key}, `;
            expressionAttributeValues[':' + key] = info[key];
        }
    });
    updateExpression = updateExpression.slice(0, -2);

    const params = {
        TableName: table,
        Key: {
            id,
        },
        ExpressionAttributeNames: expressionAttributeNames,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ...(group && { ConditionExpression: 'id = :id' }),
        ReturnValues: 'ALL_NEW',
    };

    return (await docClient.update(params).promise()).Attributes;
};

export { updateItem };