import express, { request, response } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from "openai";

dotenv.config();
const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
  });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', async (request, response) => {
    response.status(200).send({
        message: 'Hello from CodeGPT',
    })
});

app.post('/', async (request, response) => {
    try {
        const prompt = request.body.prompt;

        const resp = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature: 0,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });
        console.log(resp)
        response.status(200).send({
            bot: resp.choices[0].message.content
        })
    } catch (error) {
        console.log(error);
        response.status(500).send({error});
    }
});


app.get('/addData', async (request, response) => {
    // Extract FormData from the request
    const data = await request.formData();
    // Extract the uploaded file from the FormData
    const file = data.get("file");
  
    // Make sure file exists
    if (!file) {
      return response.json({ success: false, error: "No file found" });
    }
  
    // Make sure the file is a PDF
    if (file.type !== "application/pdf") {
      return response.json({ success: false, error: "Invalid file type" });
    }
  
    // Use the PDFLoader to load the PDF and split it into smaller documents
    const pdfLoader = new PDFLoader(file);
    const splitDocuments = await pdfLoader.loadAndSplit();
  
    // Initialize the Pinecone client
    const pineconeClient = new PineconeClient();
    await pineconeClient.init({
      apiKey: process.env.PINECONE_API_KEY || "",
      environment: "us-east-1-aws",
    });
    const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME);
  
    // Use Langchain's integration with Pinecone to store the documents
    await PineconeStore.fromDocuments(splitDocuments, new OpenAIEmbeddings(), {
      pineconeIndex,
    });
  
    return response.json({ success: true });
  }
  );

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));
