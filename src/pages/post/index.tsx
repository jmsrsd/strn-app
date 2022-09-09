import { useRef } from "react";
import { trpc } from "~/utils/trpc";
import { strict } from "~/utils/user";

export const getServerSideProps = strict.getServerSideUser;

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
          {titles.isLoading ? (
            <div>Loading...</div>
          ) : (
            Object.keys(titles.data ?? []).map((id, i) => {
              const title = (titles.data ?? {})[id];
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
