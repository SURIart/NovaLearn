const { DynamoDBClient, ScanCommand, BatchWriteItemCommand } = require("@aws-sdk/client-dynamodb");



const BATCH_SIZE = 25;

async function fetchAndTransferLessons(curriculumName,userId) {
  console.log("UserId using:",userId);
  const client = new DynamoDBClient({
    region: "us-east-1",
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: "fakeMyKeyId",
      secretAccessKey: "fakeSecretAccessKey"
    }
  });
  let lastEvaluatedKey = null;

  do {
    // Step 1: Fetch from AllLessons
    const scanParams = {
      TableName: "AllLessons",
      FilterExpression: "contains(Curriculum, :curName)",
      ExpressionAttributeValues: {
        ":curName": { S: curriculumName },
      },
      Limit: BATCH_SIZE,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    const scanResult = await client.send(new ScanCommand(scanParams));
    const lessons = scanResult.Items || [];
    lastEvaluatedKey = scanResult.LastEvaluatedKey;

    console.log(lessons);

    if (lessons.length === 0) break;

    // Step 2: Transform data to match UserLessons schema
    const userLessons = lessons.map(item => ({
        PutRequest: {
          Item: {
            UserId: { S: userId },
            LessonId: { S: item.LessonId.S }, // Assuming it's a string
            Curriculum: { S: item.Curriculum.S },
            LessonContent: { S: "" },
            Keywords: { L: item.keywords.L || [] }, // Assuming it's a list
            ExternalResources: { S: "" },
            DifficultyLevel: { S: item.Difficulty.S }, // Assuming it's a number
            EstimatedCompletionTime: { N: item?.EstimatedCompletionTime?.N?.toString() || "0" }, // Assuming it's a number
          },
        },
      }));

      


    // Step 3: Batch Write to UserLessons
    const batchWriteParams = {
      RequestItems: {
        UserLessons: userLessons.slice(0, BATCH_SIZE),
      },
    };

    await client.send(new BatchWriteItemCommand(batchWriteParams));
    console.log(`Inserted ${userLessons.length} lessons into UserLessons`);
  } while (lastEvaluatedKey);

  return "All lessons processed successfully!";
}

// // Call the function
// fetchAndTransferLessons("microprocessor","55e02377-6b3a-40cc-b550-7bea3088c5d6");

module.exports = fetchAndTransferLessons;
