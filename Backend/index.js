const express = require("express");
const multer = require('multer');
const cors = require("cors");
const axios = require('axios');
const { InsertUser, fetchAllUsers, LoginUser, processStream, CheckCurriculum, fetchAllCurriculum, InsertUserCurriculum, fetchUserCurriculum, getUserLessonWithDetails, getUnEnrollLessons, insertMindMap, insertUserAssessmentMarks, updateLessonContent, checkAndInsertMindMap, personalizeAndUpdateLesson,getRoadmap } = require("./crud");
const { HashPassword, DeHashPassword } = require("./password_hash");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand ,BatchGetCommand} = require("@aws-sdk/lib-dynamodb");
const { response } = require("express");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const fetchAndTransferLessons = require("./userlessons");
const {CHAT_API_URL} = require("./api.js");
const {sendDataAndStore,storeData}= require("./whiteboard_crud.js");


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

const app = express();
//middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/getUsers", async (req, res) => {
    const result = await fetchAllUsers("Users");
    try {
        res.json(result);
        console.log(result);
    } catch (e) {
        res.status(500).json({
            error: result
        });
    }
});

app.post("/register", async (req, res) => {
    console.log(req.body);
    const { FullName, Email, Password } = req.body;
    const result = await InsertUser(FullName, Email, Password);
    res.json(result);
});

app.post("/login", async (req, res) => {
    console.log(req.body);
    const { Email, Password } = req.body;
    const result = await LoginUser(Email, Password);
    res.json(result);
});


app.post("/setCurriculum", async (req, res) => {
    try {
        var { userId } = req.body;
        var { curriculum } = req.body;
        // ✅ Check curriculum inside the loop
        const checkResult = await CheckCurriculum(curriculum);
        if (checkResult.Msg === "Curriculum existing") {
            console.warn("⚠️ Curriculum already exists:", curriculum);
            var result = { Msg: "Curriculum already exists" }; // 🔴 Exits immediately
        }
        else {
            var result = await processStream(userId, curriculum);
        }
        res.json(result);
    } catch (e) {
        console.log(e);
    }
})

app.post('/setUserCurriculum', async (req, res) => {
    try {
        const { userId, pathId, curriculum } = req.body;
        const res1 = await fetchAndTransferLessons(curriculum, userId);
        const res2 = await InsertUserCurriculum(userId, pathId);
        const result = {
            Msg: {
                res1,
                res2
            }
        }
        res.send(result);
    } catch (e) {
        res.json(e);
    }
})

app.get('/getCurriculum', async (req, res) => {
    try {
        const result = await fetchAllCurriculum();
        console.log(result);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
})

app.post('/getUserCurriculum', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("getting curriculum for userId:", userId);
        const result = await fetchUserCurriculum(userId);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
})


app.post('/getUserEnrollLessons', async (req, res) => {
    try {
        const { userId, lessonId } = req.body;
        const result = await getUserLessonWithDetails(userId, lessonId);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
})


app.post('/getUnEnrollLessons', async (req, res) => {
    try {
        const { LessonId } = req.body;
        const result = await getUnEnrollLessons(LessonId);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
})

app.post('/mindmap', async (req, res) => {
    try {
        var { userId } = req.body;
        var { lessonId } = req.body;
        var { subject } = req.body;
        let response = await checkAndInsertMindMap(userId, lessonId, subject);
        res.json(response);
    } catch (error) {
        console.log('nodefail:', error);
        res.json(e);
    }
})

app.post('/addUserMarks', async (req, res) => {
    try {
        var { userId } = req.body;
        var { memoryScore } = req.body;
        var { logicalScore } = req.body;
        var { comprehensionScore } = req.body;
        let response = await insertUserAssessmentMarks(userId, memoryScore, comprehensionScore, logicalScore);
        res.json(response);
    } catch (error) {
        res.json(error);
    }
})

app.post('/getLessonContent', async (req, res) => {
    try {
        const { userId, lessonId, lessonName, curriculum } = req.body;
        const result = await updateLessonContent(userId, lessonId, lessonName, curriculum);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
})

app.post('/getPersonalizedNotes', async (req, res) => {
    try {
        const { userId, lessonId, title, Subject, LessonContent, Email, UserPreference } = req.body;
        const result = await personalizeAndUpdateLesson(userId, lessonId, title, Subject, LessonContent, Email, UserPreference);
        res.json(result);
    }
    catch (e) {
        res.json(e);
    }
})


app.get('/getRoadmap/:pathid',async (req,res)=>{
    const {pathid} = req.params;
    const response = await getRoadmap(pathid);
    const responseObject = Object.fromEntries(response);
    res.send(responseObject);
})

// Configure storage
const storage = multer.diskStorage({
    destination: './',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
  });
  
const upload = multer({ storage });

app.post('/generateWhiteBoard', upload.single('image'), async (req, res) => {
    try {
      const { prompt } = req.body;
      console.log('Prompt:', prompt);
  
      if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded' });
      }
  
      const imagePath = req.file.path; // Path provided by multer
      console.log('File uploaded and stored at:', imagePath);
  
      const result = await sendDataAndStore(imagePath, prompt);
  
      if (!result) {
        return res.status(500).send({ error: 'Failed to process data' });
      }
  
      res.send({
        message: 'success',
        prompt: result.prompt,
        response: result.response,
        imageUrl: result.imageUrl,
      });
  
    } catch (error) {
      console.error('Error in /generateWhiteBoard:', error);
      res.status(500).send({ error: error.message });
    }
  });

  app.post('/storeWhiteBoard',async (req,res)=>{
        const {userId, lessonId, imageUrl, prompt, response} = req.body;
        try{
            const result = await storeData(userId,lessonId,imageUrl,prompt,response);
            res.send({
                message:'saved successfully'
            })
        }catch(e){
            console.log(e);
            res.send({
                message: e
            })
        }
        
  })

  app.post("/fetch-whiteboard-details", async (req, res) => {
    try {
      const { userId, lessonId, whiteboardIds } = req.body;
  
      if (!userId || !lessonId || !Array.isArray(whiteboardIds) || whiteboardIds.length === 0) {
        return res.status(400).json({ error: "Missing or invalid parameters" });
      }
  
      const formattedWhiteboardIds = whiteboardIds.map(id => id.S || id);
  
      const uniqueKeys = [...new Set(formattedWhiteboardIds)].map(whiteboardId => ({
        UserID: userId,
        "LessonId#WhiteboardId": `${lessonId}#${whiteboardId}` 
      }));
  
      const batchGetCommand = new BatchGetCommand({
        RequestItems: {
          "WhiteBoard": { Keys: uniqueKeys }
        }
      });
  
      const whiteboardData = await docClient.send(batchGetCommand);
  
      res.json({
        success: true,
        whiteboards: whiteboardData.Responses?.WhiteBoard || []
      });
  
    } catch (error) {
      console.error("❌ Error fetching whiteboard details:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
 


const DOUBT_SOLVING_TABLE = "DoubtSolving";


// ✅ **POST: Ask AI & Store in DoubtSolving Table**
app.post("/ask-ai", async (req, res) => {
    console.log(CHAT_API_URL);
    try {
        const { userId,topic, question } = req.body;
        if (!topic || !question || !userId) {
            return res.status(400).json({ error: "Missing required fields: topic, question, userId" });
        }

        // Prepare API request body
        const requestBody = {
            topic,
            conversation: [
                { role: "system", content: `You are a tutor who is an expert in ${topic}.` },
                { role: "user", content: question }
            ]
        };

        console.log("📩 Sending request to AI Chat API:", requestBody);

        // Call the AI API
        const response = await axios.post(CHAT_API_URL, requestBody);
        const aiResponse = response.data; // A

        res.json({
            success: true,
            AIResponse: aiResponse
        });
    } catch (error) {
        console.error("❌ Error calling AI API or storing in DB:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.post("/save-doubt", async (req, res) => {
    try {
        const { userId, question, aiResponse, lessonId } = req.body;

        if (!userId || !question || !aiResponse || !lessonId) {
            return res.status(400).json({ error: "Missing required fields: userId, question, aiResponse, lessonId" });
        }

        // Generate unique DoubtId and Timestamp
        const doubtId = uuidv4();
        const timestamp = new Date().toISOString();
        const sortKey = `${lessonId}#${doubtId}`; // Composite Sort Key

        // Store in DoubtSolving Table
        const putDoubtCommand = new PutCommand({
            TableName: "DoubtSolving",
            Item: {
                UserId: userId,               // Partition Key
                "LessonId#DoubtId": sortKey,  // Composite Sort Key
                DoubtId: doubtId,             // Unique Identifier
                LessonId: lessonId,           // To allow queries on LessonId
                Prompt: question,
                AIResponse: aiResponse,
                AddedAt: timestamp
            }
        });

        await docClient.send(putDoubtCommand);

        // Update the UserLessons Table - Add DoubtId to the List
        const updateUserLessonsCommand = new UpdateCommand({
            TableName: "UserLessons",
            Key: { UserId: userId, LessonId: lessonId }, // Assuming this is how your table is structured
            UpdateExpression: "SET DoubtSolvingIds = list_append(if_not_exists(DoubtSolvingIds, :emptyList), :doubtId)",
            ExpressionAttributeValues: {
                ":doubtId": [doubtId], // Add the new doubtId to the list
                ":emptyList": [] // If the list doesn't exist, initialize it
            },
            ReturnValues: "UPDATED_NEW"
        });

        await docClient.send(updateUserLessonsCommand);

        res.json({
            success: true,
            message: "Doubt saved and user lesson updated successfully!",
            doubtId: doubtId
        });

    } catch (error) {
        console.error("❌ Error saving doubt:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// ✅ **GET: Fetch Doubt Details for a List of DoubtIds**
app.post("/fetch-doubt-details", async (req, res) => {
    try {
        const { userId, lessonId, doubtIds } = req.body;

        if (!userId || !lessonId || !Array.isArray(doubtIds) || doubtIds.length === 0) {
            return res.status(400).json({ error: "Missing or invalid parameters: userId, lessonId, doubtIds (must be a non-empty array of strings)" });
        }

        // Ensure doubtIds is an array of strings
        const formattedDoubtIds = doubtIds.map(doubt => doubt.S || doubt); // Handle both formats

        // Remove duplicates and construct keys
        const uniqueKeys = [...new Set(formattedDoubtIds)].map(doubtId => ({
            UserId: userId,
            "LessonId#DoubtId": `${lessonId}#${doubtId}`
        }));

        // Fetch doubts using BatchGetCommand
        const batchGetCommand = new BatchGetCommand({
            RequestItems: {
                "DoubtSolving": { Keys: uniqueKeys }
            }
        });

        const doubtsData = await docClient.send(batchGetCommand);

        res.json({
            success: true,
            doubts: doubtsData.Responses?.DoubtSolving || []
        });

    } catch (error) {
        console.error("❌ Error fetching doubt details:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.listen(9000, '0.0.0.0', () => console.log("server is listening.."));



