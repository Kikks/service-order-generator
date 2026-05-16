import { createServer } from "http";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { config } from "dotenv";

// Load environment variables
config();

const PORT = process.env.API_PORT || 3001;

// Schema for the parsed service order
const ServiceOrderSchema = z.object({
	serviceInfo: z
		.object({
			title: z.string().describe("The title or theme of the service"),
			serviceDate: z
				.string()
				.describe("The date of the service in YYYY-MM-DD format"),
			serviceTime: z
				.string()
				.describe("The start time of the first segment in HH:MM 24-hour format")
		})
		.optional()
		.describe("Overall service information extracted from the header"),
	segments: z
		.array(
			z.object({
				title: z.string().describe("The name/description of the segment"),
				startTime: z
					.string()
					.describe("Start time in HH:MM 24-hour format (e.g., 10:15)"),
				duration: z.number().describe("Duration in minutes as an integer"),
				personAssigned: z
					.string()
					.optional()
					.describe("Name of the person responsible for this segment")
			})
		)
		.describe("Array of program segments in chronological order")
});

const SYSTEM_PROMPT = `You are a service order parser. Your job is to extract structured program segments from unstructured service order text.

Guidelines:
1. Extract all program segments in chronological order
2. Convert all times to 24-hour format (HH:MM)
3. Calculate duration from time ranges if provided, otherwise use the explicit duration
4. Handle common inconsistencies gracefully:
   - "pm" that should be "am" (e.g., "10:25pm" in a morning service should be "10:25")
   - Misnumbered items (just order them chronologically by time)
   - Missing information (omit optional fields if not present)
5. For service info:
   - Extract the service title/theme from the header
   - Parse the date into YYYY-MM-DD format
   - Use the earliest segment time as serviceTime
6. Clean up segment titles:
   - Remove leading numbers/bullets
   - Remove asterisks and formatting markers
   - Keep the essential description`;

const server = createServer(async (req, res) => {
	// CORS headers
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.writeHead(204);
		res.end();
		return;
	}

	if (req.url === "/api/generate-service-order" && req.method === "POST") {
		let body = "";

		req.on("data", chunk => {
			body += chunk.toString();
		});

		req.on("end", async () => {
			try {
				const { text, model } = JSON.parse(body);

				if (!text || typeof text !== "string") {
					res.writeHead(400, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: "Missing or invalid 'text' field" }));
					return;
				}

				const apiKey = process.env.ANTHROPIC_API_KEY;
				if (!apiKey) {
					res.writeHead(500, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({ error: "Anthropic API key not configured" })
					);
					return;
				}

				const anthropic = createAnthropic({ apiKey });
				const modelId =
					model || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

				console.log(`Generating service order with model: ${modelId}`);

				const result = await generateObject({
					model: anthropic(modelId),
					schema: ServiceOrderSchema,
					system: SYSTEM_PROMPT,
					prompt: `Parse the following service order text and extract all program segments:\n\n${text}`
				});

				const segments = result.object.segments.map((segment, index) => ({
					...segment,
					id: `gen-${Date.now()}-${index}`
				}));

				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ ...result.object, segments }));
			} catch (error) {
				console.error("Error generating service order:", error);

				// Check for specific error types
				let errorMessage = "Failed to generate service order";
				let statusCode = 500;

				if (error instanceof Error) {
					if (
						error.message.includes("Overloaded") ||
						error.message.includes("529")
					) {
						errorMessage =
							"AI service is temporarily overloaded. Please try again in a moment.";
						statusCode = 503;
					} else if (
						error.message.includes("401") ||
						error.message.includes("authentication")
					) {
						errorMessage =
							"Invalid API key. Please check your ANTHROPIC_API_KEY.";
						statusCode = 401;
					} else if (
						error.message.includes("rate") ||
						error.message.includes("429")
					) {
						errorMessage =
							"Rate limit exceeded. Please wait before trying again.";
						statusCode = 429;
					} else {
						errorMessage = error.message;
					}
				}

				res.writeHead(statusCode, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: errorMessage }));
			}
		});
	} else {
		res.writeHead(404, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "Not found" }));
	}
});

server.listen(PORT, () => {
	console.log(`API server running at http://localhost:${PORT}`);
});
