import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { BingAIClient } from "@waylaidwanderer/chatgpt-api"
import { env } from "~/env.mjs";

const pageSize = 10;

export const newsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        topic: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // const count = await ctx.db.news.count()
      const { cursor, topic } = input
      let newsList = [];
      if (topic) {
        newsList = await ctx.db.news.findMany({
          take: pageSize + 1,
          where: {
            topic: topic
          },
          // skip: input.pageNum * pageSize,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: {
            published_date: 'desc'
          }
        })
      } else {
        newsList = await ctx.db.news.findMany({
          take: pageSize + 1,
          // skip: input.pageNum * pageSize,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: {
            published_date: 'desc'
          }
        })
      }
      let nextCursor: typeof cursor | undefined = undefined;
      if (newsList.length > pageSize) {
        const nextItem = newsList.pop();
        nextCursor = nextItem!.id;
      }

      return {
        newsList,
        nextCursor
      };
    }),
  searchNewsByTitle: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        searchText: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // const count = await ctx.db.news.count()
      const { cursor, searchText } = input
      let newsList = [];
      if (searchText.trim().length > 0) {
        newsList = await ctx.db.news.findMany({
          take: pageSize + 1,
          cursor: cursor ? { id: cursor } : undefined,
          where: {
            title: {
              contains: searchText
            }
          },
          orderBy: {
            published_date: 'desc'
          }
        })
      } else {
        return null;
      }

      let nextCursor: typeof cursor | undefined = undefined;
      if (newsList.length > pageSize) {
        const nextItem = newsList.pop();
        nextCursor = nextItem!.id;
      }

      return {
        newsList,
        nextCursor
      };
    }),
  getSummary: publicProcedure
    .input(
      z.object({
        article: z.string().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { article } = input
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const bingAIClient = new BingAIClient({
        // Necessary for some people in different countries, e.g. China (https://cn.bing.com)
        host: '',
        // "_U" cookie from bing.com
        userToken: env.BING_TOKEN,
        // If the above doesn't work, provide all your cookies as a string instead
        cookies: '',
        // A proxy string like "http://<ip>:<port>"
        proxy: '',
        // (Optional) Set to true to enable `console.debug()` logging
        debug: false,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const response = await bingAIClient.sendMessage(
        `Summarize the following text in 5 key points, each points no more than 15 words, do not search web or show reference, give me only the result:
            ${article ?? ""}
            `, {
        toneStyle: 'precise', // or creative, precise, fast
        jailbreakConversationId: true,
        onProgress: (token: string) => {
          // process.stdout.write(token);
        },
      });
      console.log(JSON.stringify(response, null, 2)); // {"jailbreakConversationId":false,"conversationId":"...","conversationSignature":"...","clientId":"...","invocationId":1,"messageId":"...","conversationExpiryTime":"2023-03-08T03:20:07.324908Z","response":"Here is a short poem about cats that I wrote: ... I hope you like it. 😊","details":{ /* raw response... */ }}

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      return response;
    }),
});

