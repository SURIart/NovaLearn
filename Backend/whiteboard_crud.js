const axios = require('axios');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand ,BatchGetCommand} = require("@aws-sdk/lib-dynamodb");const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const fs = require('fs');
const {uploadImageToCloudinary} = require('./upload-to-cloudinary');
const {WHITEBOARD_URL} = require('./api');

// Initialize DynamoDB Client
const client = new DynamoDBClient({
    region: "us-east-1",
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: "fakeMyKeyId",
      secretAccessKey: "fakeSecretAccessKey"
    }
  });

  const docClient = DynamoDBDocumentClient.from(client);

  async function storeData(userId, lessonId, imageUrl, prompt, aiResponse) {
    if (!userId || !lessonId || !imageUrl || !prompt || !aiResponse) {
      throw new Error('Missing required data. Ensure userId, lessonId, imageUrl, prompt, and aiResponse are all provided.');
    }
  
    const whiteboardId = uuidv4();
    
    // Insert data into WhiteBoard table
    try {
      const params = {
        TableName: 'WhiteBoard',
        Item: {
          UserID: { S: userId },
          'LessonId#WhiteboardId': { S: `${lessonId}#${whiteboardId}` },
          WhiteBoardId: { S: whiteboardId },
          Image: { S: imageUrl },
          Prompt: { S: prompt },
          AIResponse: { S: aiResponse },
          AddedAt: { S: new Date().toISOString() },
        },
      };
  
      await client.send(new PutItemCommand(params));
      console.log('Data saved to WhiteBoard table:', params.Item);
    } catch (error) {
      console.error('Error storing data in WhiteBoard table', error);
      return; // Stop further execution if the first insert fails
    }
  
    // Update the UserLessons Table to add WhiteboardId
    try {
      const updateUserLessonsCommand = new UpdateCommand({
        TableName: "UserLessons",
        Key: { 
          UserId: userId,
          LessonId: lessonId
        },
        UpdateExpression: "SET WhiteBoardIds = list_append(if_not_exists(WhiteBoardIds, :emptyList), :whiteboardId)",
        ExpressionAttributeValues: {
          ":whiteboardId": [whiteboardId], // Use plain whiteboardId here
          ":emptyList": []
        },
        ReturnValues: "UPDATED_NEW"
      });
  
      await docClient.send(updateUserLessonsCommand);
      console.log('UserLessons table updated successfully with WhiteBoardId:', whiteboardId);
    } catch (error) {
      console.error('Error updating UserLessons table:', error);
    }
  }
  

async function sendDataAndStore(imagePath, prompt) {
    let cloudinary_url = "";
    let aiResponse = "";
  
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found at path: ${imagePath}`);
      }
  
      // Prepare FormData with image and prompt
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));
      formData.append('prompt', prompt);
  
      const response = await axios.post(WHITEBOARD_URL, formData, {
        headers: { ...formData.getHeaders() },
      });
  
      cloudinary_url = await uploadImageToCloudinary(imagePath);
      aiResponse = response.data.analysis;
      console.log(aiResponse);
  
    } catch (error) {
      console.error('Error in sendDataAndStore:', error);
    }
  
    return { prompt, response: aiResponse, imageUrl: cloudinary_url };
  }
  
// sendDataAndStore('123','456','./screenshot_1743316873805.png','give me the name in the image');

module.exports = {sendDataAndStore,storeData};
