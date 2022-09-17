import cuid from 'cuid';
import { useState } from 'react';
import LoadingBar from '~/components/LoadingBar';
import LoadingSpinner from '~/components/LoadingSpinner';
import { Model } from '~/utils/model';
import { strict } from '~/utils/user';

const models = {
  ...Model("posts", ($) => ({
    ...$("title").text,
    ...$("content").document,
  })),
};

export const getServerSideProps = strict.getServerSideUser;

const PostTile = (props: {
  id: string;
  disabled?: boolean;
  onDropping?: (id: string) => Promise<void>;
  onDropped?: (id: string) => Promise<void>;
}) => {
  const { id, disabled, onDropping, onDropped } = props;
  const { posts } = models;
  const post = posts?.id(id);
  const title = post?.title?.get();
  const drop = posts?.drop();
  const isLoading = !!title?.isLoading || !!drop?.isLoading;

  return (
    <button
      className="w-96 flex flex-row items-center"
      disabled={isLoading || !!disabled}
      onClick={async () => {
        if (!!onDropping) await onDropping(id);
        await drop?.mutateAsync(id);
        if (!!onDropped) await onDropped(id);
      }}
    >
      <pre className="text-left">
        {JSON.stringify(
          {
            id: isLoading ? "..." : id,
            title: isLoading ? "..." : title?.data ?? "",
          },
          null,
          2
        )}
      </pre>
      <div className="grow"></div>
      <div>{isLoading ? <LoadingSpinner /> : <></>}</div>
    </button>
  );
};

export default strict.withUser((user) => {
  const { posts } = models;
  const [skip, setSkip] = useState(0);
  const maxEntitiesLength = 4;
  const browse = posts?.browse({
    skip,
    take: maxEntitiesLength,
    order: "desc",
  });
  const count = posts?.count();
  const length = count?.data ?? 1;
  const entities = browse?.data ?? [];
  const add = posts?.id(cuid()).title?.set();
  const [loading, setLoading] = useState(false);
  const isLoading = [
    !!loading,
    !!count?.isLoading,
    !!count?.isRefetching,
    !!add?.isLoading,
    !!browse?.isLoading,
    !!browse?.isRefetching,
  ].reduce((p, c) => p || c);
  const splice = (id: string) => {
    const index = entities.indexOf(id);
    if (index > -1) browse?.data?.splice(index, 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-2">
      <div className="h-96" />
      <button
        disabled={isLoading}
        onClick={async () => {
          await add?.mutateAsync("TEST");
          await Promise.all([browse?.refetch(), count?.refetch()]);
        }}
      >
        {isLoading ? "LOADING" : "ADD POST"}
      </button>
      <div className="flex flex-row space-x-4">
        <button
          disabled={isLoading}
          onClick={() => {
            const newSkip = skip - maxEntitiesLength;
            setSkip(newSkip < 0 ? 0 : newSkip);
          }}
        >
          {"<"}
        </button>
        <div>{`${
          !!count?.data
            ? Math.round((skip / length) * length) / maxEntitiesLength + 1
            : "..."
        } / ${
          !!count?.data ? Math.ceil(length / maxEntitiesLength) : "..."
        }`}</div>
        <button
          disabled={isLoading}
          onClick={() => {
            const maxSkip =
              Math.ceil(length / maxEntitiesLength) * maxEntitiesLength -
              maxEntitiesLength;
            const newSkip = skip + maxEntitiesLength;
            setSkip(newSkip > maxSkip ? maxSkip : newSkip);
          }}
        >
          {">"}
        </button>
      </div>
      {isLoading ? <LoadingBar /> : <></>}
      <div className="flex flex-col space-y-2">
        {entities.map((id, index) => {
          return (
            <div key={index}>
              <PostTile
                id={id}
                disabled={isLoading}
                onDropping={async (id) => {
                  setLoading(true);
                }}
                onDropped={async (id) => {
                  await Promise.all([browse?.refetch(), count?.refetch()]);
                  splice(id);
                  const entitiesLength = browse?.data?.length ?? 0;
                  const newSkip =
                    entitiesLength < 1 ? skip - maxEntitiesLength : skip;
                  setSkip(newSkip < 0 ? 0 : newSkip);
                  setLoading(false);
                }}
              ></PostTile>
            </div>
          );
        })}
      </div>
      {isLoading ? <LoadingSpinner /> : <></>}
      <div className="h-96" />
    </div>
  );
});

/*
export default strict.withUser((user) => {
  const titles = trpc.useQuery(["post.titles"]);
  const add = trpc.useMutation(["post.add"], {
    onSuccess: async () => {
      await titles.refetch();
    },
  });
  const remove = trpc.useMutation(["post.remove"], {
    onSuccess: async () => {
      await titles.refetch();
    },
  });
  const titleInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start">
      <div className="my-80 w-80 flex flex-col items-start space-y-8">
        <h1 className="text-xl">Posts</h1>
        <form
          className="flex flex-col space-y-2 w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            const title = titleInputRef.current?.value;
            if (!title) return;
            await add.mutateAsync({ title });
            titleInputRef.current.value = "";
          }}
        >
          <input
            className="border border-black px-2"
            placeholder="Title"
            ref={titleInputRef}
            disabled={add.isLoading || remove.isLoading}
          />
          <button
            className="bg-black text-white font-bold"
            type="submit"
            disabled={add.isLoading || remove.isLoading}
          >
            {add.isLoading || remove.isLoading ? `LOADING...` : `ADD POST`}
          </button>
        </form>
        <div className="flex flex-col space-y-4 w-full">
          {titles.isLoading ? <div>Loading...</div> : (
            Object.keys(titles.data ?? []).map((id, i) => {
              const title = "";
              // const title = (titles.data ?? {})[id];
              return (
                <div className="flex flex-row space-x-4" key={i}>
                  <div className="grow truncate">{`${title}`}</div>
                  <button
                    onClick={async () => {
                      remove.mutate({ id });
                    }}
                    disabled={remove.isLoading}
                  >
                    ❌
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});
 */
