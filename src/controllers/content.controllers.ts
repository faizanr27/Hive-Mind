import { content } from "../models/content.models";
import { Request, Response } from "express";
import giveWebsiteInfo from "../scraping/Website";
import giveTweetInfo from "../scraping/Tweet";
import giveYoutubeInfo from "../scraping/Youtube";
import { createEmbeddings, createQueryEmbeddings, model1 } from "../utils/embeds";
import { cosineSimilarity } from "../utils/embeds";
import { chunkText } from "../utils/chunk";
import axios from "axios";


function detectUrlType(url:string):string {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube";
  } else if (url.includes("twitter.com") || url.includes("x.com")) {
      return "twitter";
  } else {
      return "website";
  }
}

//https://mwn9p70n-5000.inc1.devtunnels.ms/

function averagePooling(embeddings: number[][]): number[] {
    const numChunks = embeddings.length;
    const embeddingSize = embeddings[0].length;

    // Initialize an array to store the averaged embedding
    const averagedEmbedding = new Array(embeddingSize).fill(0);

    // Sum all embeddings
    for (const embedding of embeddings) {
        for (let i = 0; i < embeddingSize; i++) {
            averagedEmbedding[i] += embedding[i];
        }
    }

    // Divide by the number of chunks to get the average
    for (let i = 0; i < embeddingSize; i++) {
        averagedEmbedding[i] /= numChunks;
    }

    return averagedEmbedding;
}

export async function createContent(req: Request, res: Response){
  try {
      const link = req.body.link;
      const type = detectUrlType(link);
      let result;
      let contentText = "N/A"; // Default content

    //   console.log("Detected URL Type:", type);
      // Fetch content based on type
      switch (type) {
          case "youtube":
              result = await giveYoutubeInfo(link);
              contentText = `${result.title || ""} ${result.description || ""} ${result.content || ""}`;
              break;
          case "twitter":
              result = await giveTweetInfo(link);
              contentText = `${result.description || ""} by ${result.creatorName || ""}`;
              break;
          default:
                const requestBody = { url: link };
                const response = await axios.post(
                "https://web2md.shortsy.xyz/scrape",
                requestBody,
                { headers: { "Content-Type": "application/json" } }
                );
                // console.log("API Response:", response);
                result = response.data; // Extract response data
                console.log("API Response:", result.result);
                if (result) {
                   contentText = `${result?.result?.title || ""}\n\n${result?.result?.markdown || ""}`;
                  }
      }
      console.log(contentText)

   // Generate embeddings for content
      const chunks = chunkText(contentText);
      const embeddings = await Promise.all(
          chunks.map(chunk => createEmbeddings(chunk))
      );


      console.log(embeddings)

      const aggregatedEmbedding = averagePooling(embeddings);

      console.log(aggregatedEmbedding)
      console.log("Content Text:", contentText);

      // Save content to MongoDB
      await content.create({
          link,
          type,
          title: result?.result?.title || "",
          content: contentText,
          embeddings: aggregatedEmbedding,
          userId: res.locals.jwtData,
          tags: []
      });

      res.json({
          success: true,
          message: "Content added successfully",
      });
  } catch (error: any) {
      console.error("Error in createContent:", error.message);
      res.status(500).json({
          success: false,
          message: "Failed to add content",
          error: error.message,
      });
  }
};

export async function queryEmbeddings(req: Request, res: Response) {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "Query is required" });

        console.log("User Query:", query);

        // Generate and normalize query embeddings
        let queryEmbeddings = await createQueryEmbeddings(query);
        queryEmbeddings = normalizeVector(queryEmbeddings);
        console.log("Query Embeddings:", queryEmbeddings);

        // Fetch all stored memories
        const allMemories = await content.find({ userId: res.locals.jwtData });

        if (allMemories.length === 0) {
            return res.json({ message: "No stored content found", memories: [] });
        }

        // Calculate similarity scores for all memories
        const memoryEmbeddingScore = allMemories
            .filter(memory => memory.embeddings?.length > 0)
            .map(memory => {
                const normalizedMemoryEmbeddings = normalizeVector(memory.embeddings as number[]);
                const score = cosineSimilarity(normalizedMemoryEmbeddings, queryEmbeddings);
                console.log(`Memory ID: ${memory._id}, Score: ${score}`); // Log scores for debugging
                return { ...memory.toObject(), score: isNaN(score) ? 0 : score };
            })
            .sort((a, b) => b.score - a.score);

        // Log top 5 matches for debugging
        console.log("Top 5 Matches:", memoryEmbeddingScore.slice(0, 5));

        // Determine the best match
        const bestMatch = memoryEmbeddingScore.length > 0 && memoryEmbeddingScore[0].score > 0.55
            ? memoryEmbeddingScore[0]
            : null;

        // Filter and prepare memories to be sent
        const memoriesToBeSent = memoryEmbeddingScore
            .slice(0, 10)
            .filter(memory => memory.score > 0.55)
            .map(({ embeddings, score, ...memory }) => memory);

        console.log({ bestMatch });

        if (!bestMatch) {
            return res.json({ message: "No relevant content found", memories: memoriesToBeSent });
        }

        // Generate a summary using the best match
        const prompt = `You are an AI assistant. Given the user's query and the best matching content, generate a concise and meaningful response.\n
                        User Query: "${query}"\n
                        Relevant Content: "${bestMatch.content || ""}"\n
                        Provide a clear and informative summary based on the relevant content.`;

        const result = await model1.generateContent(prompt);
        const summary = result.response?.candidates?.[0]?.content ?? "No summary found";

        res.json({ summary, bestMatch });
    } catch (error: any) {
        console.error("Error in queryEmbeddings:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

function normalizeVector(vec: number[]): number[] {
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val ** 2, 0)); // Compute L2 norm
    if (norm === 0) {
        console.warn("Vector has zero norm. Returning original vector.");
        return vec;
    }
    return vec.map(val => val / norm); // Normalize if norm is non-zero
}


export async function getContent(req: Request, res:Response){

    try {
        const userContent = await content.find({ userId: res.locals.jwtData }).populate("userId", "name");

        res.status(200).json({
          success: true,
          userContent,
        });
      } catch (error: any) {
        console.error(`Error fetching content: ${error.message}`);
        res.status(500).json({
          success: false,
          message: "Failed to fetch content.",
          error: error.message,
        });
      }
}

export async function deleteContent(req: Request, res:Response){
    const contentId = req.body.contentId;

    await content.deleteMany({
        contentId,
        userId: req.userId
    })

    res.json({
        message: "Deleted"
    })
}

// import mongoose from "mongoose";
// import 'dotenv/config';


// async function updateEmbeddingsForExistingContent(batchSize = 10) {
//     try {
//         let documents;
//         let updatedCount = 0;

//         do {
//             // Fetch a batch of documents without embeddings
//             documents = await content.find({
//                 $or: [{ embeddings: { $exists: false } }, { embeddings: null }]
//             }).limit(batchSize);

//             console.log(`Processing ${documents.length} documents...`);

//             if (documents.length === 0) break; // No more updates needed

//             const bulkOps = [];

//             for (const doc of documents) {
//                 try {
//                     const link = doc.link as string;
//                     const type = detectUrlType(link);
//                     let contentText = "N/A";

//                     switch (type) {
//                         case "youtube":
//                             const youtubeResult = await giveYoutubeInfo(link);
//                             contentText = `${youtubeResult.title || ""} ${youtubeResult.description || ""} ${youtubeResult.content || ""}`;
//                             break;
//                         case "twitter":
//                             const twitterResult = await giveTweetInfo(link);
//                             contentText = `${twitterResult.description || ""} by ${twitterResult.creatorName || ""}`;
//                             break;
//                         default:
//                             const websiteResult = await giveWebsiteInfo(link);
//                             if (Array.isArray(websiteResult) && websiteResult.length > 0) {
//                                 const firstItem = websiteResult[0];
//                                 contentText = `${firstItem.title || ""} ${firstItem.body || ""}`;
//                             }
//                     }

//                     const chunks = chunkText(contentText);
//                     const embeddings = await Promise.all(
//                         chunks.map(chunk => createEmbeddings(chunk))
//                     );


//                     console.log(embeddings)

//                     const flattenedEmbeddings = embeddings.flat();

//                     console.log(flattenedEmbeddings)

//                     bulkOps.push({
//                         updateOne: {
//                             filter: { _id: doc._id },
//                             update: { $set: { embeddings: flattenedEmbeddings } }
//                         }
//                     });
//                 } catch (error) {
//                     console.error(`Error processing document ${doc._id}:`, error);
//                 }
//             }

//             if (bulkOps.length > 0) {
//                 await content.bulkWrite(bulkOps);
//                 updatedCount += bulkOps.length;
//                 console.log(`Updated ${bulkOps.length} documents.`);
//             }

//         } while (documents.length > 0); // Continue until no more docs left

//         console.log(`Embedding update completed. Total updated: ${updatedCount}`);
//     } catch (error) {
//         console.error("Error updating embeddings:", error);
//     } finally {
//         await mongoose.connection.close();
//     }
// }

// updateEmbeddingsForExistingContent(2);
