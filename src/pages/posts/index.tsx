import LinearProgress from '@material/react-linear-progress';
import cuid from 'cuid';
import { useState } from 'react';
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
  const [isDropped, setIsDropped] = useState(false);
  const isLoading = !!title?.isLoading || !!drop?.isLoading || !!isDropped;

  return (
    <button
      className={[
        "px-4 py-4 w-80 flex flex-row items-center rounded-md border-2 border-black",
        isLoading || !!disabled ? "bg-gray-200 rounded-md" : "",
      ].join(" ")}
      disabled={isLoading || !!disabled}
      onClick={async () => {
        if (!!onDropping) await onDropping(id);
        await drop?.mutateAsync(id);
        setIsDropped(true);
        if (!!onDropped) await onDropped(id);
      }}
    >
      <div>
        {isLoading ? (
          <div className="flex-grow text-left">
            <LoadingSpinner />
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="w-full flex flex-col space-y-2">
        {Object.entries({
          id: isLoading ? "" : id,
          title: isLoading ? "" : title?.data ?? "",
        }).map((e, i) => {
          const [key, value] = e;
          return (
            <div className="w-full flex flex-row items-center" key={i}>
              <div className="text-left flex-grow truncate pr-4">{value}</div>
              <div className="bg-black text-white font-bold px-2 py-1 rounded-md">
                {key}
              </div>
            </div>
          );
        })}
      </div>
    </button>
  );
};

export default strict.withUser((user) => {
  const { posts } = models;
  const [skip, setSkip] = useState(0);
  const take = 4;
  const order = "desc";
  const browse = posts?.browse({ skip, take, order });
  const taken = browse?.data?.length ?? 0;
  const count = posts?.count();
  const total = count?.data ?? 1;
  const maxSkip = Math.ceil(total / take) * take - take;
  const ids = browse?.data ?? [];
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
  const invalidate = async () => {
    await Promise.all([browse?.invalidate(), count?.invalidate()]);
  };
  const refetch = async () => {
    await Promise.all([browse?.refetch(), count?.refetch()]);
  };
  const drop = (id: string) => {
    const index = ids.indexOf(id);
    if (index > -1) browse?.data?.splice(index, 1);
  };
  const page = {
    current: Math.round((skip / total) * total) / take + 1,
    last: Math.ceil(total / take),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start space-y-2">
      <div className="h-20" />
      <button
        disabled={isLoading}
        className="px-4 py-2 rounded-md bg-black text-white font-bold"
        onClick={async () => {
          await add?.mutateAsync("TEST");
          await refetch();
        }}
      >
        {isLoading ? "LOADING" : "ADD POST"}
      </button>
      <div className="h-2" />
      <div className="w-80">
        <LinearProgress
          indeterminate={isLoading}
          progress={isLoading ? undefined : 1.0}
        />
      </div>
      <div className="h-2" />
      <div className="flex flex-row items-center space-x-4">
        <button
          disabled={isLoading}
          className="px-4 py-2 rounded-md bg-black text-white font-bold"
          onClick={() => {
            const newSkip = skip - take;
            setSkip(newSkip < 0 ? 0 : newSkip);
          }}
        >
          {"<"}
        </button>
        <div>{`${!!count?.data ? page.current : "..."} / ${
          !!count?.data ? page.last : "..."
        }`}</div>
        <button
          disabled={isLoading}
          className="px-4 py-2 rounded-md bg-black text-white font-bold"
          onClick={() => {
            const newSkip = skip + take;
            setSkip(newSkip > maxSkip ? maxSkip : newSkip);
          }}
        >
          {">"}
        </button>
      </div>
      <div className="h-2" />
      <div className="flex flex-col space-y-4">
        {ids.length < 1 && isLoading ? (
          <div className="flex flex-col items-center justify-center w-80 h-80">
            <LoadingSpinner />
          </div>
        ) : (
          ids.map((id) => {
            return (
              <div key={id}>
                <PostTile
                  id={id}
                  disabled={isLoading}
                  onDropping={async (id) => {
                    setLoading(true);
                  }}
                  onDropped={async (id) => {
                    drop(id);
                    await invalidate();
                    await refetch();
                    drop(id);
                    const newSkip = taken < 1 ? skip - take : skip;
                    setSkip(newSkip < 0 ? 0 : newSkip);
                    setLoading(false);
                  }}
                ></PostTile>
              </div>
            );
          })
        )}
      </div>
      <div className="h-20" />
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
