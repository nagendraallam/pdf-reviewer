import { NextRequest, NextResponse } from 'next/server';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// In-memory storage for the vector store (in production, use a persistent database)
declare global {
  var vectorStore: MemoryVectorStore | null;
}

if (!global.vectorStore) {
  global.vectorStore = null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    if (!file || !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Please upload a PDF file' },
        { status: 400 }
      );
    }

    console.log('Processing PDF:', file.name);

    // Convert File to Blob and then to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

    // Load the PDF
    console.log('Loading PDF content...');
    const loader = new PDFLoader(blob);
    const pages = await loader.load();
    console.log('PDF loaded successfully, pages:', pages.length);

    // Initialize Ollama embeddings
    console.log('Initializing Ollama embeddings...');
    const embeddings = new OllamaEmbeddings({
      model: "deepseek-coder-v2",
      baseUrl: "http://localhost:11434",
    });

    // Create and store the vector store
    console.log('Creating vector store...');
    global.vectorStore = await MemoryVectorStore.fromDocuments(pages, embeddings);
    console.log('Vector store created successfully');

    return NextResponse.json({ 
      message: 'PDF processed successfully',
      pageCount: pages.length
    });
  } catch (error) {
    console.error('Detailed error processing PDF:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}