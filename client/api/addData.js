import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from require("langchain/embeddings/openai");
import { PineconeStore } from require("langchain/vectorstores/pinecone");
import * as dotenv from 'dotenv';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

dotenv.config({path:'server/.env'});
const app = express();
app.use(cors());
app.use(express.json());
console.log(process.env.PINECONE_API_KEY);


app.get('/api/addData', async (request, response) => {
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
