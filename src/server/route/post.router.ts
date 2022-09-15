import { createRouter, withAuthResolver } from "~/server/router";
import { Model, ModelAttributes } from "~/utils/db";
import { appRoute } from "./app.router";

export const Post = Model({
  application: appRoute,
  domain: "post",
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
      await Post.find("title").string("Hello");
      const post = Post.id("abc123");
      await post.content?.get();
    }),
  });
