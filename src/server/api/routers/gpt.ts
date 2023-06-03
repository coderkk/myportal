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

const gptOutputSchema = z.object({
  invoiceNo: z.string().describe("The invoice number. Defaults to ''."),
  invoiceDate: z
    .string()
    .describe(
      "The invoice date. Should be returned in the form of dd/mm/yyyy. Defaults to today's date."
    ),
  vendorName: z
    .string()
    .describe(
      "The vendor name. The vendor name is a company name and should not be mistaken as the supplier name. Defaults to ''."
    ),
  supplierName: z
    .string()
    .describe(
      "The supplier name. The supplier name should not be mistaken as the vendor name. Defaults to ''."
    ),
  supplierAddress: z
    .string()
    .describe("The supplier's address. Defaults to ''."),
  supplierPhone: z
    .string()
    .describe(
      "The supplier's phone number. should be in the format of 'xxx-xxx-xxxx' where x is any digit, Defaults to '012-245-6789'."
    ),
  subtotal: z
    .number()
    .describe("The sum of the totalPrice of all items. Defaults to 0."),
  taxes: z
    .number()
    .describe(
      "The taxes incurred. DO NOT multiply the tax with any percentages. Defaults to 0."
    ),
  discount: z.number().describe("The discount given, if any. Defaults to 0."),
  grandTotal: z
    .number()
    .describe("The subtotal plus taxes less discount. Defaults to 0."),
  supplierInvoiceItems: z
    .array(
      z.object({
        description: z
          .string()
          .describe(
            "Item description. DO NOT include unit or quantity in the description. Defaults to ''."
          ),
        quantity: z
          .number()
          .describe(
            "Item quantity. Should be a whole number. Treat synonymous terms like 'Quantity/ (x)' as quantity too. (x) can be any value. Defaults to 0."
          ),
        unit: z
          .string()
          .describe(
            "Item unit. It takes values such as 'M', 'M2', 'M3', 'g', 'kg', 'tons', 'feet', 'NR', or '1'. Defaults to NR."
          ),
        unitPrice: z
          .number()
          .describe(
            "The unit price of an item. It represents a currency or monetary value. Defaults to 0."
          ),
        totalPrice: z
          .number()
          .describe(
            "The total price equals unitPrice multiplied by quantity. Defaults to 0."
          ),
      })
    )
    .describe("Items of the invoice. Defaults to an empty array []."),
});

export type gptOutputSchema = z.infer<typeof gptOutputSchema>;

export const config = {
  runtime: "edge",
};

export const gptRouter = createTRPCRouter({
  extractInvoiceInfo: protectedProcedure
    .input(extractInvoiceInfoSchema)
    .mutation(async ({ input }) => {
      return await trycatch({
        fn: async () => {
          const parser = StructuredOutputParser.fromZodSchema(gptOutputSchema);
          const formatInstructions = parser.getFormatInstructions();

          const prompt = new PromptTemplate({
            template: `Ensure that all fields in the JSON headings are filled, and any missing input is represented as 0.\nTreat synonymous terms like total, final cost, total payable, etc., as grand_total.\n Ensure to thoroughly check the extracted information before finalising the output.\n Take your time and avoid confusion between "quantity" and "unit_price". Determine which one is closest to having a monetary value or being a currency.\n Lastly, MAKE SURE all inputs ARE DETECTED, DO NOT MISS any.\n Please RUN the prompt TWICE before providing the output.\n {format_instructions}\nUser input: \n{user_input}`,
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

          // const textSplitter = new RecursiveCharacterTextSplitter({
          //   chunkSize: 1000,
          // });
          // const docs = await textSplitter.createDocuments([promptInput]);

          // // This convenience function creates a document chain prompted to summarize a set of documents.
          // const chain = loadSummarizationChain(model, { type: "map_reduce" });
          // const res = await chain.call({
          //   input_documents: docs,
          // });

          // console.log("===================================================");
          // console.log(res.text);

          // const response = await model.call(promptInput);

          // Bad response - this will fail on await parser.parse(response); This is only here to test the fixParser code block.
          //   const response = `{ "vendor_name": "Global Wholesaler Azure Interior" "invoice_no": "INV/2023/03/0008", "invoice_date": "03/20/2023", "items": [ { "description": "Beeswax XL Acme beeswax", "unit": "kg", "quantity": 1, "unit_price": 42.00, "element_cost": 42.00 }, { "description": "Office Chair", "unit": "Units", "quantity": 1, "unit_price": 70.00, "element_cost": 70.00 }, { "description": "Olive Oil", "unit": "L", "quantity": 1, "unit_price": 10.00, "element_cost": 10.00 }, { "description": "Luxury Truffles", "unit": "g", "quantity": 15, "unit_price": 10.00, "element_cost": 150.00 } ], "subtotal": 262.90, "tax": 16.94, "discount": 0, "total_sum": 279.84 }`;

          const response = JSON.stringify({
            invoiceNo: "181565",
            invoiceDate: "15/01/2022",
            vendorName: "H & K TECHNOLOGY SY STEM(002298433-P)",
            supplierName: "",
            supplierAddress: "19-1A ,jalan 10/125D ,tmn desa petaling",
            supplierPhone: "0198533338",
            subtotal: 5305,
            taxes: 0,
            discount: 0,
            grandTotal: 5305,
            supplierInvoiceItems: [
              {
                description: "Supply 1.5HP panasonic air cond",
                quantity: 2,
                unit: "NR",
                unitPrice: 1430,
                totalPrice: 2860,
              },
              {
                description: "Install 1.5HP air cond include 10ft copper paip",
                quantity: 2,
                unit: "NR",
                unitPrice: 300,
                totalPrice: 600,
              },
              {
                description: 'Supply 2" x 3" pvc casing',
                quantity: 4,
                unit: "NR",
                unitPrice: 25,
                totalPrice: 100,
              },
              {
                description: "Chemical wash 1HP air cond",
                quantity: 2,
                unit: "NR",
                unitPrice: 130,
                totalPrice: 260,
              },
              {
                description: "Install light",
                quantity: 3,
                unit: "NR",
                unitPrice: 30,
                totalPrice: 90,
              },
              {
                description: "Supply & change air cond switch",
                quantity: 4,
                unit: "NR",
                unitPrice: 40,
                totalPrice: 160,
              },
              {
                description: "Extra copper paip",
                quantity: 22,
                unit: "NR",
                unitPrice: 15,
                totalPrice: 330,
              },
              {
                description: "Supply & change switches",
                quantity: 13,
                unit: "NR",
                unitPrice: 13,
                totalPrice: 169,
              },
              {
                description: "Wiring 13A power point",
                quantity: 3,
                unit: "NR",
                unitPrice: 70,
                totalPrice: 210,
              },
              {
                description: "Supply & change 4FT LED tube",
                quantity: 22,
                unit: "NR",
                unitPrice: 13,
                totalPrice: 286,
              },
              {
                description: "Supply & change 2pole main switch & ELCB",
                quantity: 1,
                unit: "NR",
                unitPrice: 150,
                totalPrice: 150,
              },
              {
                description: "Remote control",
                quantity: 3,
                unit: "NR",
                unitPrice: 30,
                totalPrice: 90,
              },
            ],
          });
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
