import { useState } from 'react';
import { trpc } from '~/utils/trpc';
import { strict } from '~/utils/user';

const useTextAttribute = (args: { entity: string; key: string }) => {
  const { entity, key } = args;
  const query = trpc.useQuery(["strndb.text.get", args]);
  const mutation = trpc.useMutation(["strndb.text.set"], {
    onSuccess: async () => {
      await query.refetch();
    },
  });
  const isLoading = query.isLoading || mutation.isLoading;
  return { query, mutation, isLoading, entity, key };
};

const useTitle = (entity: string) => {
  return useTextAttribute({ entity, key: "title" });
};

const PostTile = (props: { entity: string }) => {
  const { entity } = props;
  const [mutationTimer, setMutationTimer] = useState<any>(null);
  const title = useTitle(entity);
  const [titleValue, setTitleValue] = useState<string | undefined>(undefined);
  return (
    <div className="flex flex-col">
      <input
        disabled={!title.query.data}
        className="border-2 border-black"
        value={titleValue ?? title.query.data?.value ?? ""}
        onChange={async (e) => {
          setTitleValue(e.target.value);

          clearTimeout(mutationTimer);
          setMutationTimer(
            setTimeout(async () => {
              await title.mutation.mutateAsync({
                entity,
                key: title.key,
                value: e.target.value,
              });
              clearTimeout(mutationTimer);
              setMutationTimer(null);
            }, 500)
          );
        }}
      ></input>
      <p>
        {title.mutation.isLoading
          ? "Saving..."
          : title.query.isLoading
          ? "Loading..."
          : !!mutationTimer
          ? "Typing..."
          : "Synched"}
      </p>
    </div>
  );
};

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser((user) => {
  const [skip, setSkip] = useState(0);
  const take = 4;
  const Post = {
    document: "post",
  };
  const browse = trpc.useQuery([
    "strndb.entity.browse",
    { ...Post, skip, take, orderBy: { createdAt: "desc" } },
  ]);
  const create = trpc.useMutation("strndb.entity.create", {
    onSuccess: async () => {
      await browse.refetch();
    },
  });
  const remove = trpc.useMutation("strndb.entity.delete", {
    onSuccess: async () => {
      await browse.refetch();
    },
  });
  const isLoading = browse.isLoading || create.isLoading || remove.isLoading;

  return (
    <div className="flex flex-col space-y-4 items-center">
      <div className="flex flex-row justify-center space-x-4">
        <button
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white font-bold"
          onClick={async () => {
            const prev = skip - take;
            setSkip(prev < 0 ? 0 : prev);
          }}
        >
          {"<"}
        </button>
        <button
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white font-bold"
          onClick={async () => {
            await create.mutateAsync(Post);
          }}
        >
          {isLoading ? "LOADING..." : "ADD"}
        </button>
        <button
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white font-bold"
          onClick={async () => {
            setSkip(browse.data?.next ?? skip);
          }}
        >
          {">"}
        </button>
      </div>
      <pre className="w-full">
        {JSON.stringify({ ...browse.data, result: undefined }, null, 2)}
      </pre>
      <div className="w-full flex flex-col space-y-4">
        {browse.data?.result.map((entity) => {
          return (
            <div key={entity.id}>
              <PostTile entity={entity.id} />
            </div>
          );
          // return (
          //   <pre key={entity.id}>
          //     <button
          //       disabled={isLoading}
          //       className="text-left"
          //       onClick={async () => {
          //         await remove.mutateAsync({ id: entity.id });
          //       }}
          //     >
          //       {JSON.stringify(entity, null, 2)}
          //     </button>
          //   </pre>
          // );
        })}
      </div>
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
