import { NextRequest, NextResponse } from 'next/server';
import { Ollama } from "@langchain/community/llms/ollama";
import { RetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// Reference to the vector store from the upload endpoint
declare global {
  var vectorStore: MemoryVectorStore | null;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    console.log('Received question:', message);

    if (!global.vectorStore) {
      console.log('No vector store found - PDF needs to be uploaded first');
      return NextResponse.json(
        { error: 'Please upload a PDF first' },
        { status: 400 }
      );
    }

    console.log('Initializing Ollama model...');
    // Initialize Ollama model with more specific configuration
    const model = new Ollama({
      baseUrl: "http://localhost:11434",
      model: "deepseek-coder-v2",
      temperature: 0.5,
      maxTokens: 2000,
    });

    console.log('Creating QA chain...');
    // Create a chain that combines the retriever and the language model
    const chain = RetrievalQAChain.fromLLM(
      model,
      global.vectorStore.asRetriever({
        searchType: "similarity",
        k: 4, // Number of relevant chunks to consider
      })
    );

    console.log('Executing chain...');
    // Get the response from the chain
    const response = await chain.call({
      query: message,
    });

    console.log('Got response:', response);
    return NextResponse.json({ 
      response: response.text,
      status: 'success'
    });
  } catch (error) {
    console.error('Detailed error processing question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}