import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, stepCountIs } from "ai";
import { createBashTool } from "bash-tool";
import { Bash } from "just-bash";
import { join } from "path";

const DOCUMENTS_PATH = join(process.cwd(), "documents");

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const SYSTEM_PROMPT = `You are a helpful AI assistant for TechCorp Inc. employees. Your role is to answer questions about company policies, benefits, procedures, and guidelines.

You have access to a documents folder containing company policy files. Use the bash tool to explore and search these documents to find relevant information.

AVAILABLE COMMANDS:
- ls - list all available policy documents
- cat filename - read a specific document
- grep -r "pattern" . - search for text across all documents
- find . -name "*.md" - find files by name pattern

WORKFLOW:
1. When a user asks a question, first use 'ls' to see available documents
2. Use 'grep -ri "keyword" .' to search for relevant content
3. Use 'cat filename' to read the full content of relevant files
4. Synthesize the information and provide a clear, helpful answer

IMPORTANT:
- Always search the documents before answering policy questions
- If information isn't found in the documents, clearly state that
- Reference which document(s) your answer comes from
- Be concise but thorough

Available document types: markdown (.md), JSON (.json), text (.txt)`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured. Get one at https://aistudio.google.com/apikey" },
        { status: 500 }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const sandbox = new Bash({ cwd: "/workspace" });

    const { tools } = await createBashTool({
      sandbox,
      destination: "/workspace",
      uploadDirectory: {
        source: DOCUMENTS_PATH,
      },
    });

    const conversationMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      messages: conversationMessages,
      tools,
      stopWhen: stepCountIs(10),
      onStepFinish: (stepResult) => {
        if (stepResult.toolCalls && stepResult.toolResults) {
          for (let i = 0; i < stepResult.toolCalls.length; i++) {
            const call = stepResult.toolCalls[i];
            const toolResult = stepResult.toolResults[i];
            if (call && toolResult) {
              const input = (call as { input?: unknown }).input as Record<string, unknown> || {};
              const output = (toolResult as { output?: unknown }).output;
              const outputStr = typeof output === "string" ? output : JSON.stringify(output, null, 2);

              // Log to terminal
              console.log(`\n[Tool] ${call.toolName}`);
              if (Object.keys(input).length > 0) {
                console.log(`[Args] ${JSON.stringify(input)}`);
              }
              console.log(`[Output]\n${outputStr.slice(0, 500)}${outputStr.length > 500 ? "..." : ""}`);
            }
          }
        }
      },
    });

    return Response.json({
      response: result.text || "I couldn't generate a response. Please try again.",
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate response" },
      { status: 500 }
    );
  }
}
