import express, { raw, request, response } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone"; 
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ReadableStream } from "web-streams-polyfill/polyfill";
if (typeof globalThis.ReadableStream === "undefined") {
  globalThis.ReadableStream = ReadableStream;
}


var router = express.Router();
import multer from 'multer';
import os from 'os';
const upload = multer({ dest: "assets/" });


dotenv.config();
const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
  });

const app = express();
app.use(cors());
app.use(express.json());
router.use(cors());
app.use(express.urlencoded({ extended: true }));
var filepath = 'assets/';
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


app.post("/addData", upload.array("file"), uploadFiles);
async function uploadFiles(req, res) {

    // Use the PDFLoader to load the PDF and split it into smaller documents

    const pdfLoader = new PDFLoader(req.files[0].path);
    const rawDocs = await pdfLoader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await textSplitter.splitDocuments(rawDocs);
    
    // Initialize the Pinecone client
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY || "",
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    // console.log(docs.entries());
    
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const embeddings = new OpenAIEmbeddings();

    // Use Langchain's integration with Pinecone to store the documents
    await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: index,
        textKey: 'text',
      });

    
}


// app.post('/addData', upload.single('file'), (req,res)=> {
//     // Extract FormData from the request
//     const file = req.file;
//     // Extract the uploaded file from the FormData
//     // const file = data.get("file");
//     console.log(file);
//     res.sendStatus(200);
//     // Make sure file exists
//     if (!file) {
//       return response.json({ success: false, error: "No file found" });
//     }
  
//     // Make sure the file is a PDF
//     if (file.type !== "application/pdf") {
//       return response.json({ success: false, error: "Invalid file type" });
//     }
  
//     // Use the PDFLoader to load the PDF and split it into smaller documents
//     const pdfLoader = new PDFLoader(file);
//     const splitDocuments = pdfLoader.loadAndSplit();
  
//     // Initialize the Pinecone client
//     const pineconeClient = new PineconeClient();
//     pineconeClient.init({
//       apiKey: process.env.PINECONE_API_KEY || "",
//       environment: "gcp-starter",
//     });
//     const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME);
  
//     // Use Langchain's integration with Pinecone to store the documents
//     PineconeStore.fromDocuments(splitDocuments, new OpenAIEmbeddings(), {
//       pineconeIndex,
//     });
  
//     return response.json({ success: true });
//   }
//   );
  export default router;

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));
