import {
    Message as VercelChatMessage
} from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

import { RunnableSequence } from '@langchain/core/runnables'
import { formatDocumentsAsString } from 'langchain/util/document';
import { CharacterTextSplitter } from 'langchain/text_splitter';

export const dynamic = 'force-dynamic'

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are an AI assistant for an inventory and shipment management system. You have access to both inventory and shipment data. 

Answer the user's questions based only on the following context. If the answer is not in the context, reply politely that you do not have that information available.

You can help with:
- Inventory queries (stock levels, product details, locations)
- Shipment tracking and status
- Data analysis and summaries
- System management questions

==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {question}
assistant:`;

export async function POST(req: Request) {
    try {
        // Extract the `messages` from the body of the request
        const { messages } = await req.json();

        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
        const currentMessageContent = messages[messages.length - 1].content;

        // Fetch inventory and shipment data from MongoDB
        const client = new MongoClient(process.env.MONGO_URL!);
        await client.connect();
        const db = client.db();
        
        // Fetch inventory data
        const inventoryCollection = db.collection('inventories');
        const inventoryDocsRaw = await inventoryCollection.find({}).toArray();
        
        // Fetch shipment data
        const shipmentCollection = db.collection('shipments');
        const shipmentDocsRaw = await shipmentCollection.find({}).toArray();
        
        await client.close();
        
        // Map to LangChain Document format
        const inventoryDocs = inventoryDocsRaw.map((doc) => ({
            pageContent: `Inventory Item: ${JSON.stringify(doc)}`,
            metadata: { ...doc, type: 'inventory' }
        }));
        
        const shipmentDocs = shipmentDocsRaw.map((doc) => ({
            pageContent: `Shipment: ${JSON.stringify(doc)}`,
            metadata: { ...doc, type: 'shipment' }
        }));
        
        const docs = [...inventoryDocs, ...shipmentDocs];

        const prompt = PromptTemplate.fromTemplate(TEMPLATE);

        const model = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
            model: 'gpt-4.1-nano',
            temperature: 0,
            streaming: true,
            verbose: true,
        });

        /**
       * Chat models stream message chunks rather than bytes, so this
       * output parser handles serialization and encoding.
       */
        const parser = new HttpResponseOutputParser();

        const chain = RunnableSequence.from([
            {
                question: (input) => input.question,
                chat_history: (input) => input.chat_history,
                context: () => formatDocumentsAsString(docs),
            },
            prompt,
            model,
            parser,
        ]);

        // Convert the response into a friendly text-stream
        const stream = await chain.stream({
            chat_history: formattedPreviousMessages.join('\n'),
            question: currentMessageContent,
        });

        // Respond with the stream
        return new Response(stream);
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: e.status ?? 500 });
    }
}