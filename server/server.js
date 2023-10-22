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
app.use(express.json());

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

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));
