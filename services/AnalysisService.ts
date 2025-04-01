// Implementation of scholar analysis service using LangChain with RAG (Retrieval Augmented Generation)
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import { RunnableSequence } from "langchain/schema";
import { StringOutputParser } from "langchain/schema/output_parser";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Configuration settings
const OPENAI_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "default-key-please-set-environment-variable",
  defaultModel: "gpt-4o",
  temperature: 0.7,
};

// Function to validate OpenAI API key format
const isValidOpenAIKey = (key) => {
  if (typeof key !== 'string') return false;
  return key.startsWith('sk-') && key.length > 20;
};

// Logging API key status (only show first/last characters for security)
if (isValidOpenAIKey(OPENAI_CONFIG.apiKey)) {
  const keyStart = OPENAI_CONFIG.apiKey.substring(0, 5);
  const keyEnd = OPENAI_CONFIG.apiKey.substring(OPENAI_CONFIG.apiKey.length - 4);
  console.log(`OpenAI API key format valid: ${keyStart}...${keyEnd}`);
} else {
  console.error("OpenAI API key format appears invalid or not set in environment variables!");
  throw new Error("Valid OpenAI API key is required for this application to function properly.");
}

// Hardcoded scholar content - temporarily until we can properly load files
// Small sample of content from each scholar to enable RAG functionality
const scholarContent = {
  welsing: `
    The Cress Theory of Color-Confrontation and Racism postulates that the white or color-deficient Europeans responded psychologically with a sense of numerical inadequacy and color inferiority upon their confrontations with the majority of the world's people, all of whom possessed varying degrees of color-producing capacity. This psychological response was the development of a defensively structured thought or ideology and behavioral stress response pattern to overcome the sense of inadequacy. The behavioral response is expressed against all people with the capacity to produce the melanin skin pigments. This behavioral stress response developed into the social system of racism. This formulation, perhaps for the first time, establishes a coherent framework in which the dynamic historical behavior of the white population can be understood and always predicted.
    The genetic recessive nature of white skin means that genetic annihilation is inevitable. This fundamental reality is central to understanding white supremacy's psychological motivations and systemic expressions. When white people encounter people with melanin, there exists an unconscious awareness of genetic vulnerability that manifests as fear, hostility, and systems of racial domination.
  `,
  wilson: `
    Black-on-Black violence and criminality are not the result of some genetic or cultural defect in the Black psyche, but are primarily reactions to and symptoms of the oppressive character of White American society. When we do not recognize this fact, our attempts to resolve these critical problems are very often naive and misdirected. We must recognize that these problems are in many ways politically and economically motivated, and to a very significant extent, their perpetuation serves important political and economic functions for America.
    The oppression of Blacks in America is primarily motivated by economic and political considerations. The psychological impact of racism is epiphenomenal. White racism is rooted in the European character and its development resulting from their climatic and geographic circumstances. The African American problem can't be eliminated until we thoroughly understand the nature of our oppression and its relationship to the needs of White America.
  `,
  barashango: `
    The way of life for African people (ancient and modern) is characterized by the following principles which collectively form a cultural matrix: 1) Acceptance of the interdependence and complementation of all living things. 2) Special reverence for ancestors and elders as the "living library" of the accumulated wisdom of the people. 3) A preference for making use of knowledge for human advancement and to maintain the harmony of nature, rather than for the domination of nature. 4) The elevation of femininity to the realm of the divine.
    European historiography deliberately distorts the true history of Africa and the African people's contributions to world civilization. This historical revisionism serves to maintain systems of white supremacy by disconnecting African Americans from their cultural heritage and instilling a sense of inferiority. The deliberate suppression of African historical achievements is a cornerstone of white psychological warfare against Black people.
  `
};

// Scholar expertise descriptions for prompt construction
const scholarExpertise = {
  welsing: {
    name: 'Dr. Frances Cress Welsing',
    expertise: 'Psychological analysis of systemic racism',
    perspective: 'Focuses on color-confrontation theory and psychological impacts of white supremacy',
    imagePath: require('@/assets/images/fcwelsing.png'),
    shortDescription: 'Developer of the Cress Theory of Color Confrontation and expert on the psychological impacts of white supremacy'
  },
  wilson: {
    name: 'Dr. Amos Wilson',
    expertise: 'Power dynamics and socio-economic structures',
    perspective: 'Analyzes Black power, economics, and political frameworks',
    imagePath: require('@/assets/images/dramos-Photoroom.png'),
    shortDescription: 'Expert on power dynamics, economic frameworks and the psychology of Black liberation'
  },
  barashango: {
    name: 'Dr. Ishakamusa Barashango',
    expertise: 'Historical context and European influence',
    perspective: 'Examines historical revisionism and African spiritual traditions',
    imagePath: require('@/assets/images/ishakamusa-Photoroom.png'),
    shortDescription: 'Historian focused on revisionist African history and spiritual systems'
  }
};

// Vector store instances for each scholar
let vectorStores = {
  welsing: null,
  wilson: null,
  barashango: null
};

// LLM instance creation with improved error handling
let model;
try {
  // Using ChatOpenAI for better compatibility with modern API
  model = new ChatOpenAI({
    openAIApiKey: OPENAI_CONFIG.apiKey,
    temperature: OPENAI_CONFIG.temperature,
    modelName: OPENAI_CONFIG.defaultModel,
  });
  console.log("OpenAI chat model initialized successfully");
  
  // Add a logging wrapper to help debug API calls
  const originalInvoke = model.invoke.bind(model);
  model.invoke = async (params) => {
    try {
      console.log("Invoking OpenAI chat model with messages");
      const result = await originalInvoke(params);
      console.log("OpenAI API call successful");
      return result;
    } catch (error) {
      console.error("Error in OpenAI API call:", error);
      throw error;
    }
  };
} catch (error) {
  console.error("Failed to initialize OpenAI model:", error);
  throw new Error("Failed to initialize OpenAI model. This is required for scholar analysis.");
}

// Initialize vector stores with embedded content
const initializeVectorStores = async () => {
  try {
    // Check if we're in a web environment
    const isWeb = typeof window !== 'undefined';
    let useStoredEmbeddings = false;
    
    // Only try to load from AsyncStorage if we're not in a web environment
    if (!isWeb) {
      try {
        const storedEmbeddings = await AsyncStorage.getItem('scholarEmbeddings');
        if (storedEmbeddings) {
          console.log("Loading embeddings from storage");
          vectorStores = JSON.parse(storedEmbeddings);
          useStoredEmbeddings = true;
        }
      } catch (storageError) {
        console.warn("Error loading from AsyncStorage:", storageError);
        // Continue with initialization
      }
    }
    
    // If we couldn't load from storage or we're in a web environment, initialize from scratch
    if (!useStoredEmbeddings) {
      console.log("Initializing vector stores with hardcoded content");
      
      // Create embeddings with better error handling
      console.log("Creating OpenAI embeddings");
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: OPENAI_CONFIG.apiKey
      });
      console.log("OpenAI embeddings created successfully");
      
      // Initialize text splitter
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });
      
      // Process each scholar's content
      for (const scholarId in scholarExpertise) {
        // Get hardcoded content
        const content = scholarContent[scholarId];
        
        if (content) {
          // Split text into chunks
          const textChunks = await textSplitter.splitText(content);
          
          // Create vector store
          vectorStores[scholarId] = await MemoryVectorStore.fromTexts(
            textChunks,
            { scholarId, name: scholarExpertise[scholarId].name },
            embeddings
          );
          
          console.log(`Successfully created vector store for ${scholarId}`);
        }
      }
      
      // Try to store in AsyncStorage if not in web environment
      if (!isWeb) {
        try {
          await AsyncStorage.setItem('scholarEmbeddings', JSON.stringify(vectorStores));
        } catch (saveError) {
          console.warn("Error saving to AsyncStorage:", saveError);
          // Continue anyway
        }
      }
    }
    
    // Verify all vector stores are initialized
    const allStoresInitialized = ['welsing', 'wilson', 'barashango'].every(id => 
      vectorStores[id] && typeof vectorStores[id].similaritySearch === 'function'
    );
    
    if (!allStoresInitialized) {
      throw new Error("Failed to initialize all vector stores");
    }
    
    console.log("Vector stores initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing vector stores:", error);
    throw error; // Rethrow so we properly handle the error upstream
  }
};

// Function to get relevant context from scholar's works
const getScholarContext = async (scholarId, topic) => {
  try {
    // Ensure vectorStores is initialized
    if (!vectorStores[scholarId]) {
      console.log(`VectorStore for ${scholarId} not found, initializing...`);
      await initializeVectorStores();
    }
    
    // Double-check after initialization
    if (!vectorStores[scholarId]) {
      throw new Error(`VectorStore for ${scholarId} not available after initialization`);
    }
    
    // Get relevant documents from vector store with timeout
    console.log(`Performing similarity search for ${scholarId} on topic: ${topic}`);
    
    // Set a timeout for similarity search
    const searchPromise = vectorStores[scholarId].similaritySearch(topic, 3);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Similarity search timed out after 10 seconds")), 10000);
    });
    
    // Race between search and timeout
    const relevantDocs = await Promise.race([searchPromise, timeoutPromise]);
    
    // Safety check for empty results
    if (!relevantDocs || !Array.isArray(relevantDocs) || relevantDocs.length === 0) {
      console.warn("Similarity search returned no results");
      return scholarContent[scholarId]; // Use hardcoded content as fallback
    }
    
    // Extract and return text from documents
    const contextTexts = relevantDocs
      .filter(doc => doc && doc.pageContent)
      .map(doc => doc.pageContent);
    
    if (contextTexts.length === 0) {
      console.warn("No valid documents returned from similarity search");
      return scholarContent[scholarId]; // Use hardcoded content as fallback
    }
    
    return contextTexts.join("\n\n");
  } catch (error) {
    console.error(`Error retrieving context for ${scholarId}:`, error);
    throw error; // Rethrow error to handle upstream
  }
};

// Function to generate scholar analysis with RAG
const generateAnalysisWithRAG = async (scholarId, topic) => {
  console.log(`Generating analysis for ${scholarId} on topic: "${topic}"`);
  
  // Get scholar data
  const scholar = scholarExpertise[scholarId];
  if (!scholar) {
    throw new Error(`Scholar not found: ${scholarId}`);
  }
  
  // Get relevant context for the scholar
  const relevantContext = await getScholarContext(scholarId, topic);
  console.log(`Got context for ${scholarId}, length: ${relevantContext?.length || 0}`);
  
  console.log("Creating and sending OpenAI API request with LangChain messages");
  
  try {
    // Create messages using proper LangChain format
    const systemPrompt = `You are ${scholar.name}, a renowned scholar known for ${scholar.expertise}. 
Your perspective focuses on ${scholar.perspective}.
Use your authentic voice, terminology, and concepts.
Reference your key theories and perspectives.
Offer practical insights based on your worldview.
Connect the topic to broader systemic patterns you've identified.
Provide counter-racist analysis that empowers Black people.
Respond in first-person perspective throughout as if you wrote it yourself.
Keep your analysis concise but substantive (400-600 words).`;

    const userPrompt = `Please analyze the following topic: "${topic}"
  
Use these excerpts from your own works to inform your analysis:

${relevantContext || scholarContent[scholarId]}`;

    // Create proper LangChain message objects
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ];
    
    // Set timeout for API call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("OpenAI API call timed out after 30 seconds")), 30000);
    });
    
    // Call OpenAI with proper message format
    console.log("Invoking model with messages");
    const aiResponse = await Promise.race([
      model.invoke(messages),
      timeoutPromise
    ]);
    
    console.log("Successfully received AI response");
    
    // Extract text from the AI response
    let analysisText = "";
    if (aiResponse && typeof aiResponse.content === 'string') {
      analysisText = aiResponse.content;
    } else {
      // Fallback in case of unexpected response format
      console.warn("Unexpected response format:", aiResponse);
      analysisText = String(aiResponse);
    }
    
    return {
      scholar: scholar.name,
      analysis: analysisText,
      image: scholar.imagePath
    };
  } catch (error) {
    console.error(`Error generating analysis for ${scholarId}:`, error);
    throw error;
  }
};

// Function to get scholar analysis based on topic and scholar
export const getScholarAnalysis = async (topic, scholarId = 'all') => {
  console.log(`Getting scholar analysis for topic: "${topic}", scholar: "${scholarId}"`);
  
  // Handle empty or invalid topics
  if (!topic || typeof topic !== 'string' || topic.trim() === '') {
    throw new Error("Empty or invalid topic provided to getScholarAnalysis");
  }
  
  // Handle invalid scholarId
  if (!scholarId || (scholarId !== 'all' && !['welsing', 'wilson', 'barashango'].includes(scholarId))) {
    throw new Error(`Invalid scholarId provided: ${scholarId}`);
  }
  
  // Initialize vector stores if not already done
  await initializeVectorStores();
  
  if (scholarId === 'all') {
    // Get analysis from all scholars
    const results = [];
    const scholarIds = ['welsing', 'wilson', 'barashango'];
    
    // Process each scholar sequentially to avoid rate limiting
    for (const id of scholarIds) {
      const analysis = await generateAnalysisWithRAG(id, topic);
      results.push(analysis);
    }
    
    return results;
  } else {
    // Get analysis from specific scholar
    const analysis = await generateAnalysisWithRAG(scholarId, topic);
    return [analysis];
  }
};

// Add this function to load text from assets
const loadTextAssets = async () => {
  console.log("Loading text assets is temporarily disabled");
  // We'll use the hardcoded content instead of trying to load text files dynamically
  // React Native doesn't support dynamic requires, so we need to hardcode paths
  
  return {
    welsing: scholarContent.welsing,
    wilson: scholarContent.wilson,
    barashango: scholarContent.barashango
  };
  
  /* This approach doesn't work in React Native
  try {
    const scholarTexts = {};
    
    // Fixed paths approach - we need to use static requires
    scholarTexts.welsing = await FileSystem.readAsStringAsync(
      require('@/assets/texts/Dr.FrancisCressWELSING_The Isis Papers Book.txt')
    );
    
    scholarTexts.wilson = await FileSystem.readAsStringAsync(
      require('@/assets/texts/Dr.AMOS_WILSON- European Psychological Warfare Against the Afrikan Mind Lecture.txt')
    );
    
    scholarTexts.barashango = await FileSystem.readAsStringAsync(
      require('@/assets/texts/Dr.ISHAKAMUSA_Barashango- African Genius Lecture.txt')
    );
    
    return scholarTexts;
  } catch (error) {
    console.error("Error loading text assets:", error);
    // Fall back to hardcoded content
    return {
      welsing: scholarContent.welsing,
      wilson: scholarContent.wilson,
      barashango: scholarContent.barashango
    };
  }
  */
};

// Function to initialize vector stores with additional texts when available
export const enhanceVectorStores = async () => {
  console.log("Enhancing vector stores with scholar text content");
  
  try {
    // Initialize if needed
    if (!vectorStores.welsing || !vectorStores.wilson || !vectorStores.barashango) {
      await initializeVectorStores();
    }
    
    // Load the text content
    const scholarTexts = await loadTextAssets();
    
    // Skip if no texts were loaded or texts are empty
    if (!scholarTexts || Object.keys(scholarTexts).length === 0) {
      console.log("No text assets loaded, skipping vector store enhancement");
      return false;
    }
    
    // Create embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: OPENAI_CONFIG.apiKey
    });
    
    // Initialize text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
    
    // Update vector stores with full text
    for (const scholarId in scholarTexts) {
      if (scholarTexts[scholarId]) {
        console.log(`Enhancing vector store for ${scholarId} with full text`);
        
        // Split text into chunks
        const textChunks = await textSplitter.splitText(scholarTexts[scholarId]);
        
        // Create new vector store
        vectorStores[scholarId] = await MemoryVectorStore.fromTexts(
          textChunks,
          { scholarId, name: scholarExpertise[scholarId]?.name || scholarId },
          embeddings
        );
      }
    }
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('scholarEmbeddings', JSON.stringify(vectorStores));
    console.log("Vector stores enhanced and saved");
    return true;
  } catch (error) {
    console.error("Error enhancing vector stores:", error);
    return false;
  }
};