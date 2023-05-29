import { OpenAI } from "langchain/llms/openai";
import {
  OutputFixingParser,
  StructuredOutputParser,
} from "langchain/output_parsers";
import { PromptTemplate } from "langchain/prompts";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const extractInvoiceInfoSchema = z.object({
  inputText: z.string(),
});

export const gptRouter = createTRPCRouter({
  extractInvoiceInfo: protectedProcedure
    .input(extractInvoiceInfoSchema)
    .mutation(async ({ input }) => {
      return await trycatch({
        fn: async () => {
          const parser = StructuredOutputParser.fromZodSchema(
            z.object({
              vendor_name: z
                .string()
                .describe(
                  "vendor_name is a company name. The vendor name should not be mistaken as the billing name. Defaults to ''."
                ),
              invoice_no: z
                .string()
                .describe("The invoice number. Defaults to ''."),
              invoice_date: z
                .string()
                .describe(
                  "The invoice date. Should be returned in the form of dd/mm/yyyy. Defaults to ''."
                ),
              subtotal: z.number().describe("The subtotal. Defaults to 0."),
              tax: z
                .number()
                .describe(
                  "The tax incurred. DO NOT multiply the tax with any percentages. Defaults to 0."
                ),
              discount: z
                .number()
                .describe("The discount given. Defaults to 0."),
              total_sum: z
                .number()
                .describe("The total sum of the invoice. Defaults to 0."),
              items: z
                .array(
                  z.object({
                    description: z
                      .string()
                      .describe(
                        "Item description. DO NOT include unit or quantity in the description. Defaults to ''."
                      ),
                    unit: z
                      .string()
                      .describe(
                        "Item unit. It takes values such as 'M', 'M2', 'M3', 'g', 'kg', 'tons', 'feet', 'NR', or '1'. Defaults to NR."
                      ),
                    quantity: z
                      .number()
                      .describe(
                        "Item quantity. Should be a whole number. Treat synonymous terms like 'Quantity/ (x)' as quantity too. (x) can be any value. Defaults to 0."
                      ),
                    unit_price: z
                      .number()
                      .describe(
                        "The unit price of an item. It represents a currency or monetary value. Defaults to 0."
                      ),
                    element_cost: z
                      .number()
                      .describe(
                        "The element_cost variable is the highest value among the items variables. Defaults to 0."
                      ),
                  })
                )
                .describe(
                  "Items of the invoice. Defaults to an empty array []."
                ),
            })
          );

          const formatInstructions = parser.getFormatInstructions();

          const prompt = new PromptTemplate({
            template: `Ensure that all fields in the JSON headings are filled, and any missing input is represented as 0.\nTreat synonymous terms like total, total cost, final cost, total payable, etc., as total_sum.\n Ensure to thoroughly check the extracted information before finalising the output.\n Take your time and avoid confusion between "quantity" and "unit_price". Determine which one is closest to having a monetary value or being a currency.\n Lastly, MAKE SURE all inputs ARE DETECTED, DO NOT MISS any.\n Please RUN the prompt TWICE before providing the output.\n {format_instructions}\nUser input: \n{user_input}`,
            inputVariables: ["user_input"],
            partialVariables: { format_instructions: formatInstructions },
          });

          const model = new OpenAI({
            temperature: 0,
            openAIApiKey: env.OPENAI_API_KEY,
            modelName: "gpt-3.5-turbo",
            maxTokens: -1,
          });

          const promptInput = await prompt.format({
            user_input: input.inputText,
          });
          const response = await model.call(promptInput);

          // Bad response - this will fail on await parser.parse(response); This is only here to test the fixParser code block.
          //   const response = `{ "vendor_name": "Global Wholesaler Azure Interior" "invoice_no": "INV/2023/03/0008", "invoice_date": "03/20/2023", "items": [ { "description": "Beeswax XL Acme beeswax", "unit": "kg", "quantity": 1, "unit_price": 42.00, "element_cost": 42.00 }, { "description": "Office Chair", "unit": "Units", "quantity": 1, "unit_price": 70.00, "element_cost": 70.00 }, { "description": "Olive Oil", "unit": "L", "quantity": 1, "unit_price": 10.00, "element_cost": 10.00 }, { "description": "Luxury Truffles", "unit": "g", "quantity": 15, "unit_price": 10.00, "element_cost": 150.00 } ], "subtotal": 262.90, "tax": 16.94, "discount": 0, "total_sum": 279.84 }`;
          try {
            return await parser.parse(response);
          } catch (e) {
            const fixParser = OutputFixingParser.fromLLM(
              new OpenAI({
                temperature: 0,
                openAIApiKey: env.OPENAI_API_KEY,
                modelName: "gpt-3.5-turbo",
                maxTokens: -1,
              }),
              parser
            );
            return await fixParser.parse(response);
          }
        },
        errorMessages: ["Failed to extract information"],
      })();
    }),
});
