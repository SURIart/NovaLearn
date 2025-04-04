const { HashPassword, DeHashPassword } = require("./password_hash");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand, BatchWriteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { response } = require("express");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const axios = require('axios');
const readline = require("readline");
const fetchAndTransferLessons = require("./userlessons");
const {GET_LESSONS,MIND_MAP,API_BASE_URL , PERSONALIZE_NOTES_API, ROADMAP_URL} = require("./api.js");

// Initialize DynamoDB Client
const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey"
  }
}); // Change region accordingly
const docClient = DynamoDBDocumentClient.from(client);


const TABLE_NAME = "Users"; // Change based on your table


async function InsertUser(fullName, email, password) {
  const userId = uuidv4();
  const params = {
    TableName: TABLE_NAME,
    Item: {
      Email: email, // Partition Key
      UserId: userId,
      FullName: fullName,
      Password: await HashPassword(password), // Store hashed password in real apps
      SolaceAI_Input: { AIModel_Data: {} },
      SolaceAI_Output: { AIModel_Data: {} },
      LineUpAI_Input: { AIModel_Data: {} },
      LineUpAI_Output: { AIModel_Data: {} },
      Performance: { AIModel_Data: {} },
      Curriculums: [],
      Lessons: [],
      TotalStorageUsed: 0.0,
      ProgressTrack: "Not Started"
    }
  };
  try {
    const ExistingUser = await LoginUser(email, password);
    if (ExistingUser.Msg === "User not found") {
      const command = new PutCommand(params);
      await docClient.send(command);
      console.log(params.Item);
      return {
        'Msg': 'user added successfully',
        'user': params.Item
      }
    } else {
      return {
        'Msg': 'User already existing'
      }
    }

  } catch (e) {
    return {
      'Msg': e
    }
  }
}

async function fetchAllUsers(TableName) {
  const params = {
    TableName: TableName
  }
  try {
    const command = new ScanCommand(params);
    const result = await docClient.send(command);
    return result;
  } catch (e) {
    return e;
  }
}

async function fetchAllCurriculum() {
  const params = {
    TableName: 'Curriculums'
  }
  try {
    const command = new ScanCommand(params);
    const result = await docClient.send(command);
    console.log(result);
    return result;
  } catch (e) {
    return e;
  }
}

// Function to fetch user curriculums
async function fetchUserCurriculum(userId) {
  const params = {
    TableName: "UserCurriculums",
    KeyConditionExpression: "#uid = :userId",
    ExpressionAttributeNames: {
      "#uid": "UserId"
    },
    ExpressionAttributeValues: {
      ":userId": userId
    }
  };

  try {
    const command = new QueryCommand(params);
    const result = await docClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      console.log("No curriculums found for this user.");
      return [];
    }

    console.log("Fetched user curriculums:", result.Items);

    // Extract PathIds and fetch details
    const pathIds = result.Items.map(item => item.PathId);
    return await fetchCurriculumsByPathIds(pathIds);
  } catch (error) {
    console.error("Error fetching user curriculum:", error);
    return [];
  }
}

// Function to fetch curriculums using PathIds
async function fetchCurriculumsByPathIds(pathIds) {
  if (!pathIds.length) return [];

  const promises = pathIds.map(async pathId => {
    const params = {
      TableName: "Curriculums",
      KeyConditionExpression: "#pid = :pathId",
      ExpressionAttributeNames: {
        "#pid": "PathId"
      },
      ExpressionAttributeValues: {
        ":pathId": pathId
      }
    };

    try {
      const command = new QueryCommand(params);
      const result = await docClient.send(command);
      return result.Items;
    } catch (error) {
      console.error(`Error fetching curriculum for PathId ${pathId}:`, error);
      return [];
    }
  });

  const curriculums = await Promise.all(promises);
  return curriculums.flat(); // Flatten array if multiple PathIds
}


async function LoginUser(email, password) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      Email: email
    }
  }
  try {
    const command = new GetCommand(params);
    const result = await docClient.send(command);
    if (!result.Item) {
      return {
        Msg: "User not found"
      }
    }
    const user = result.Item;
    if (await DeHashPassword(password, user.Password)) {
      return {
        Msg: "Login successfully completed",
        User: result
      }
    }
    else {
      return {
        Msg: "Check ur credentials"
      }
    }
  } catch (e) {
    return {
      Msg: e
    }
  }
}


// Function to batch write to DynamoDB (max 25 items per batch)
async function batchWriteItems(items, curr) {
  if (items.length === 0) return;

  let unprocessed = items.map((item) => ({ ...item, Curriculum: curr }));
  do {
    const params = {
      RequestItems: {
        AllLessons: unprocessed.map((item) => ({
          PutRequest: { Item: item },
        })),
      },
    };

    try {
      const result = await docClient.send(new BatchWriteCommand(params));
      unprocessed = result.UnprocessedItems?.AllLessons || [];
      if (unprocessed.length > 0) {
        console.warn(`Retrying ${unprocessed.length} unprocessed items...`);
      }
    } catch (error) {
      console.error("🔥 DynamoDB Batch Write Error:", error);
      console.error("❌ Failing Items:", JSON.stringify(unprocessed, null, 2));
      return;
    }
  } while (unprocessed.length > 0);

  console.log(`✅ Inserted ${items.length} items successfully.`);
}

// Function to process streamed data
async function processStream(userId, curriculum) {
  let lesson_names = [];
  try {
    const response = await axios({
      method: "get",
      url: `${GET_LESSONS}${curriculum}`,
      responseType: "stream",
    });

    let lessonIds = [];
    let curriculumTitle = "";
    let CurriculumDescription = "";
    let EstimatedDurations = 0;

    const rl = readline.createInterface({
      input: response.data,
      crlfDelay: Infinity,
    });

    let batch = [];
    for await (const line of rl) {
      if (!line.trim()) continue; // Skip empty lines

      try {
        let lesson = JSON.parse(line);

        // ✅ Ensure required keys exist
        if (!lesson.LessonId) {
          lesson.LessonId = uuidv4();
        }

        // 🔍 Validate item before adding to batch
        if (!lesson.LessonId || !lesson.title) {
          curriculumTitle = lesson.Curriculum;
          CurriculumDescription = lesson.Description;
          EstimatedDurations = lesson.EstimatedCompeletionTime;
          console.warn("⚠️ Missing required fields:", lesson);
          lesson_names = lesson.Lessons;
          continue; // Skip invalid entries
        }

        batch.push(lesson);
        lessonIds.push({
          'LessonName': lesson.title,
          'LessonId': lesson.LessonId
        });

        if (batch.length >= 25) {
          await batchWriteItems(batch, curriculum);
          batch = []; // Reset batch
        }
      } catch (err) {
        console.error("JSON Parse Error:", err);
      }
    }

    // Write any remaining lessons
    if (batch.length > 0) {
      await batchWriteItems(batch, curriculum);
    }

    console.log("🎉 Streaming & Writing Completed!");

    await fetchAndTransferLessons(curriculum, userId);

    console.log("🎉 inserting UserLessons Completed!");

    console.log(lesson_names);

    const roadmap = await sendLessonsToApi(lesson_names);

    console.log("🎉 inserting roadmap Completed!");

    await InsertCurriculum(userId, curriculum, CurriculumDescription, EstimatedDurations, lessonIds,roadmap);
    return {
      'Msg': 'Curriculum added successfully'
    }
  } catch (error) {
    console.error("❌ API Request Error:", error);
  }
}


async function sendLessonsToApi(lessons) {
  const url = ROADMAP_URL;

  try {
    const response = await axios.post(url, { "lessons": lessons }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Roadmap Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending data to API:', error);
    throw error;
  }
}

async function CheckCurriculum(title) {
  if (!title) {
    console.error("❌ CheckCurriculum Error: Title is missing!");
    return { Msg: "Title is required" };
  }

  const params = {
    TableName: "Curriculums",
    FilterExpression: "Title = :title",
    ExpressionAttributeValues: { ":title": title },
  };

  try {
    console.log("🔍 Checking Curriculum:", title);
    const command = new ScanCommand(params); // Use Scan instead of GetCommand
    const result = await docClient.send(command);
    console.log("📌 CheckCurriculum Result:", result);

    if (!result.Items || result.Items.length === 0) {
      return { Msg: "Curriculum not found" };
    }
    return { Msg: "Curriculum existing", Curriculum: result.Items[0] };
  } catch (error) {
    console.error("❌ CheckCurriculum Error:", error);
    return { Msg: "Error checking curriculum", Error: error };
  }
}

// 🟢 **InsertCurriculum** - Adds a new curriculum
async function InsertCurriculum(userId, title, description, duration, lessonIds,roadmap) {
  try {
    // Check if the curriculum already exists
    const checkResult = await CheckCurriculum(title);
    if (checkResult.Msg === "Curriculum existing") {
      console.warn("⚠️ Curriculum already exists:", title);
      return { Msg: "Curriculum already exists" };
    }

    // Insert new curriculum
    const params = {
      TableName: "Curriculums",
      Item: {
        PathId: `${Date.now()}`, // Unique ID
        Title: title,
        Description: description,
        EstimatedDurations: duration,
        Lessons: lessonIds,
        CreatedAt: new Date().toISOString(),
        Nodes:roadmap['Nodes'],
        Connections:roadmap['Connections']
      },
    };

    console.log("📌 Inserting Curriculum:", params.Item);
    const command = new PutCommand(params);
    await docClient.send(command);
    console.log("✅ Curriculum inserted successfully:", title);

    // Insert into UserCurriculums
    return await InsertUserCurriculum(userId, params.Item.PathId);
  } catch (error) {
    console.error("❌ InsertCurriculum Error:", error);
    return { Msg: "Error inserting curriculum", Error: error };
  }
}

// 🟢 **InsertUserCurriculum** - Links a user to a curriculum
async function InsertUserCurriculum(userId, curriculumId) {
  if (!userId || !curriculumId) {
    console.error("❌ Invalid UserId or CurriculumId:", { userId, curriculumId });
    return { Msg: "Invalid UserId or CurriculumId" };
  }

  try {
    const params = {
      TableName: "UserCurriculums",
      Item: {
        UserId: userId,
        PathId: curriculumId,
        CurrentLesson: "",
        Progress: 0,
        StartDate: new Date().toISOString(),
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
      },
    };

    console.log("📌 Inserting into UserCurriculums:", params.Item);
    const command = new PutCommand(params);
    await docClient.send(command);
    console.log("✅ UserCurriculum added successfully");

    return { Msg: "UserCurriculum added successfully", Data: params.Item };
  } catch (error) {
    console.error("❌ InsertUserCurriculum Error:", error);
    return { Msg: "Error inserting user curriculum", Error: error };
  }
}

// 🟢 Function to fetch a specific user lesson from UserCurriculum
async function fetchUserLesson(userId, lessonId) {
  const params = {
    TableName: "UserLessons",
    KeyConditionExpression: "#uid = :userId AND #lid = :lessonId",
    ExpressionAttributeNames: {
      "#uid": "UserId",
      "#lid": "LessonId"
    },
    ExpressionAttributeValues: {
      ":userId": userId,
      ":lessonId": lessonId
    }
  };

  try {
    const command = new QueryCommand(params);
    const result = await docClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      console.log(`No lesson found for UserId: ${userId} and LessonId: ${lessonId}`);
      return null;
    }

    console.log("User Lesson Data:", result.Items[0]);
    return result.Items[0];
  } catch (error) {
    console.error("Error fetching user lesson:", error);
    return null;
  }
}

// 🟢 Function to fetch lesson details from AllLessons
async function fetchLessonDetail(lessonId) {
  const params = {
    TableName: "AllLessons",
    Key: { LessonId: lessonId }
  };

  try {
    const command = new GetCommand(params);
    const result = await docClient.send(command);

    if (!result.Item) {
      console.log(`No lesson details found for LessonId: ${lessonId}`);
      return null;
    }

    console.log("Lesson Details:", result.Item);
    return result.Item;
  } catch (error) {
    console.error(`Error fetching lesson details for LessonId ${lessonId}:`, error);
    return null;
  }
}

// 🟢 Function to merge UserCurriculum and AllLessons data
async function getUserLessonWithDetails(userId, lessonId) {
  const userLesson = await fetchUserLesson(userId, lessonId);
  const lessonDetail = await fetchLessonDetail(lessonId);

  if (!userLesson || !lessonDetail) {
    return null; // No data found
  }

  // Merge both responses
  return {
    // 🟢 UserCurriculum attributes
    UserId: userLesson?.UserId ?? null,
    LessonId: userLesson?.LessonId ?? lessonDetail?.LessonId ?? null,
    Curriculum: userLesson?.Curriculum ?? null,
    EstimatedCompletionTime: userLesson?.EstimatedCompletionTime ?? lessonDetail?.EstimatedCompletionTime ?? null,
    ScheduleStatus: userLesson?.ScheduleStatus ?? null,
    ScheduledDate: userLesson?.ScheduledDate ?? null,
    Status: userLesson?.Status ?? null,
    ScheduledId: userLesson?.ScheduledId ?? null,
    MindMapID: userLesson?.MindMapID ?? null,
    WhiteBoardIds: userLesson?.WhiteBoardIds ?? null,
    DoubtSolvingIds: userLesson?.DoubtSolvingIds ?? null,
    NotesIds: userLesson?.NotesIds ?? null,

    // 🟢 AllLessons attributes
    title: lessonDetail?.title ?? null,
    Description: lessonDetail?.Description ?? null,
    Subject: lessonDetail?.subject ?? null,
    LessonContent: lessonDetail?.LessonContent ?? userLesson?.LessonContent ?? null,
    ExternalResources: lessonDetail?.ExternalResources ?? userLesson?.ExternalResources ?? null,
    Applications: lessonDetail?.Applications ?? null,
    Keywords: lessonDetail?.Keywords ?? userLesson?.Keywords ?? null,
    prequisites: lessonDetail?.prequisites ?? null,
    Next_Lesson: lessonDetail?.Next_Lesson ?? null,
    CreatedAt: lessonDetail?.CreatedAt ?? null,
    Difficulty: lessonDetail?.DifficultyLevel ?? userLesson?.DifficultyLevel ?? null
  };
}


async function getUnEnrollLessons(lessonId) {
  const params = {
    TableName: "AllLessons",
    KeyConditionExpression: "#lid = :lessonId",
    ExpressionAttributeNames: {
      "#lid": "LessonId"
    },
    ExpressionAttributeValues: {
      ":lessonId": lessonId
    }
  };

  try {
    const command = new QueryCommand(params);
    const result = await docClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      console.log(`No lesson found for LessonId: ${lessonId}`);
      return {
        Msg: `No lesson found for LessonId: ${lessonId}`
      };
    }

    console.log("User Lesson Data:", result.Items[0]);
    return result.Items[0];
  } catch (error) {
    console.error("Error fetching user lesson:", error);
    return error;
  }
}

async function insertMindMap(userId, lessonId, subject) {

  console.log(userId, lessonId);

  let mindmapId = uuidv4();
  let responseData;

  const url = `${MIND_MAP}${encodeURIComponent(subject)}`;

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      responseData = response.data;
      console.log('Received Data:', JSON.stringify(responseData, null, 2));
    } else {
      console.error('Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Request Failed:', error.message);
  }

  try {

    if (!responseData || !responseData['Nodes'] || !responseData['Connections']) {
      console.error('Missing required data for insertion');

    }

    const command = new PutCommand({
      TableName: "MindMaps",
      Item: {
        UserId: userId,
        LessonId: lessonId,
        MindMapId: mindmapId,
        Title: subject,
        Nodes: responseData['Nodes'],
        Connections: responseData['Connections']
      }
    });



    const data = await client.send(command);
    console.log(data);

    const commanduser = new UpdateCommand({
      TableName: "UserLessons",
      Key: {
        UserId: userId,
        LessonId: lessonId
      },
      UpdateExpression: "SET MindMapId = :mindMapId",
      ExpressionAttributeValues: {
        ":mindMapId": mindmapId
      },
      ReturnValues: "UPDATED_NEW"
    });

    const datauser = await client.send(commanduser);
    console.log(datauser);


  } catch (error) {
    console.error(error.message);
  }

  return {
    'Title': subject,
    'Nodes': responseData['Nodes'],
    'Connections': responseData['Connections']
  };

}

async function checkAndInsertMindMap(userId, lessonId, subject) {
  console.log(userId, lessonId);

  // Step 1: Check if MindMapId exists in UserLessons
  const checkMindMapCommand = new GetCommand({
    TableName: "UserLessons",
    Key: {
      UserId: userId,
      LessonId: lessonId
    },
    ProjectionExpression: "MindMapId"
  });

  try {
    const mindMapResult = await client.send(checkMindMapCommand);
    const existingMindMapId = mindMapResult.Item?.MindMapId;

    if (existingMindMapId) {
      console.log(`MindMapId found: ${existingMindMapId}`);

      // Step 2: Retrieve MindMap from MindMaps table
      const getMindMapCommand = new GetCommand({
        TableName: "MindMaps",
        Key: {
          UserId: userId,
          LessonId: lessonId
        }
      });

      const mindMapData = await client.send(getMindMapCommand);

      if (mindMapData.Item) {
        console.log("Retrieved MindMap:", JSON.stringify(mindMapData.Item, null, 2));
        return mindMapData.Item;
      } else {
        console.log("MindMapId exists, but no MindMap found in MindMaps table.");
        return null;
      }
    } else {
      console.log("MindMapId not found. Generating a new mind map...");
      return await insertMindMap(userId, lessonId, subject); // Call your function to generate and store
    }
  } catch (error) {
    console.error("Error checking MindMapId:", error.message);
    return null;
  }
}

async function insertUserAssessmentMarks(userId, memoryScore, comprehensionScore, logicalScore) {
  let data = {
    "memoryScore": memoryScore,
    "comprehensionScore": comprehensionScore,
    "logicalScore": logicalScore
  };
  try {

    const commanduser = new ScanCommand({
      TableName: "Users",
      FilterExpression: "UserId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      },
      ProjectionExpression: "Email"
    });

    const responseuser = await docClient.send(commanduser);

    const email = responseuser.Items[0].Email;

    const command = new UpdateCommand({
      TableName: "Users",
      Key: {
        Email: email
      },
      UpdateExpression: "SET SolaceAI_Input = :data",
      ExpressionAttributeValues: {
        ":data": data
      },
      ReturnValues: "ALL_NEW"
    });

    const response = await docClient.send(command);
    console.log("Updated Item:", response.Attributes);
    return response.Attributes;
  } catch (error) {
    console.error("Error updating item:", error.message);
    throw error;
  }

}




async function fetchLessonContent(lessonName, curriculum) {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: { topic: lessonName, subject: curriculum }
    });
    return response.data; // Assuming response contains lesson content
  } catch (error) {
    console.error("Error fetching lesson content from API:", error);
    return null;
  }
}

async function getExistingLessonContent(userId, lessonId) {
  const params = {
    TableName: "UserLessons",
    Key: {
      UserId: userId,
      LessonId: lessonId
    },
    ProjectionExpression: "LessonContent"
  };

  try {
    const command = new GetCommand(params);
    const result = await docClient.send(command);

    return result.Item ? result.Item.LessonContent : null;
  } catch (error) {
    console.error("Error fetching existing lesson content:", error);
    return null;
  }
}

async function updateLessonContent(userId, lessonId, lessonName, curriculum) {
  // Step 1: Check if lesson content already exists
  const existingContent = await getExistingLessonContent(userId, lessonId);
  if (existingContent) {
    console.log("Returning existing lesson content:", existingContent);
    return existingContent;
  }

  // Step 2: Fetch new lesson content
  const lessonContent = await fetchLessonContent(lessonName, curriculum);
  if (!lessonContent) {
    console.error("No content fetched for the lesson.");
    return null;
  }

  // Step 3: Update UserLessons table with new content
  const params = {
    TableName: "UserLessons",
    Key: {
      UserId: userId,
      LessonId: lessonId
    },
    UpdateExpression: "SET LessonContent = :lessonContent",
    ExpressionAttributeValues: {
      ":lessonContent": lessonContent
    },
    ReturnValues: "UPDATED_NEW"
  };

  try {
    const command = new UpdateCommand(params);
    const result = await docClient.send(command);
    console.log("Lesson content updated successfully:", result);
    return lessonContent; // Return new content
  } catch (error) {
    console.error("Error updating lesson content:", error);
    return null;
  }
}



async function fetchUserScores(Email) {
  const command = new GetCommand({
    TableName: "Users",
    Key: { Email: Email },
    ProjectionExpression: "SolaceAI_Input"
  });

  try {
    const result = await client.send(command);
    console.log("Fetched Item:", result.Item); // Debugging output

    if (!result.Item || !result.Item.SolaceAI_Input) {
      console.error("Error: SolaceAI_Input not found for this user.");
      return null;
    }

    const solaceAIInput = result.Item.SolaceAI_Input;

    // Directly access the numbers without ".N"
    return {
      ReadScore: parseFloat(solaceAIInput.comprehensionScore),  // comprehensionScore -> ReadScore
      SemanticScore: parseFloat(solaceAIInput.logicalScore)     // logicalScore -> SemanticScore
    };
  } catch (error) {
    console.error("Error fetching user scores:", error.message);
    return null;
  }
}




async function personalizeAndUpdateLesson(userId, lessonId, title, Subject, LessonContent, Email, UserPreference) {
  // Step 1: Fetch ReadScore & SemanticScore from Users Table
  const userData = await fetchUserScores(Email);
  if (!userData) {
    console.error("❌ User data not found!");
    return null;
  }

  const { ReadScore, SemanticScore } = userData;
  console.log(`✅ Fetched Scores - ReadScore: ${ReadScore}, SemanticScore: ${SemanticScore}`);

  // Step 2: Prepare API request payload
  const payload = {
    topic: title,
    subject: Subject,
    Readscore: ReadScore,  // Ensure correct datatype (number)
    Semanticscore: SemanticScore,
    user_preference: UserPreference,
    url: LessonContent // Ensure it's a valid string or URL
  };

  console.log("📩 API Request Payload:", payload);

  // Step 3: Call PersonalizeNotes API
  try {
    const response = await axios.post(PERSONALIZE_NOTES_API, payload);

    if (response.status !== 200) {
      console.error(`❌ Error in API Response: ${response.status} - ${response.statusText}`);
      return null;
    }

    const lessonContent = response.data;
    console.log("✅ Personalized Lesson Content:", lessonContent);

    // Step 4: Update LessonContent in UserLessons Table
    const updateCommand = new UpdateCommand({
      TableName: "UserLessons",
      Key: { UserId: userId, LessonId: lessonId },
      UpdateExpression: "SET LessonContent = :content",
      ExpressionAttributeValues: { ":content": lessonContent },
      ReturnValues: "UPDATED_NEW"
    });

    const updateResult = await client.send(updateCommand);
    console.log("✅ Lesson Content Updated Successfully:", updateResult);
    return updateResult;
  } catch (error) {
    console.error("❌ Error calling PersonalizeNotes API:", error.message);
    return null;
  }
}

async function getRoadmap(pathid){
  let curriculumMap = new Map();
  const params = {
    TableName: "Curriculums",
    Key: {
      PathId: pathid.toString()
    },
    ProjectionExpression: "Nodes,Connections" // Adjust if needed
  };

  try {
    const command = new GetCommand(params);
    const result = await docClient.send(command);
    curriculumMap.set("Nodes", result.Item.Nodes || []);
    curriculumMap.set("Connections",result.Item.Connections || []);
  }catch(error){
    console.log(error);
  }

  return curriculumMap;
}


module.exports = { InsertUser, fetchAllUsers, LoginUser, processStream, CheckCurriculum, fetchAllCurriculum, InsertUserCurriculum, fetchUserCurriculum, getUserLessonWithDetails, getUnEnrollLessons, insertMindMap, insertUserAssessmentMarks, updateLessonContent, checkAndInsertMindMap, personalizeAndUpdateLesson,getRoadmap };