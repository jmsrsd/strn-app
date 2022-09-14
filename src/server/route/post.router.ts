import { createRouter, withAuthResolver } from "~/server/router";
import { Data, db, Model, ModelAttributes } from "~/utils/db";
import { appRoute } from "./app.router";

export const Post = Model(appRoute, {
  key: "post",
  attributes: ({ text, numeric, document, file }) => ({
    ...text("title"),
    ...text("author"),
    ...document("content"),
    ...numeric("created"),
    ...numeric("updated"),
  }),
}, ModelAttributes);

export const postRouter = createRouter()
  .query("find", {
    resolve: withAuthResolver(async ({ ctx, input }) => {
      const post = Post.id("abc123");
      await post.content?.get();
    }),
  });
