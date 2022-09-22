import LinearProgress from '@material/react-linear-progress';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import LoadingSpinner from '~/components/LoadingSpinner';
import { trpc } from '~/utils/trpc';
import { strict } from '~/utils/user';

const useTextAttribute = (args: { entity: string; attribute: string }) => {
  const query = trpc.useQuery(["strndb.text.get", args]);

  const mutation = trpc.useMutation(["strndb.text.set"], {
    onSuccess: async () => await query.refetch(),
  });

  const isLoading =
    query.isLoading ||
    query.isFetching ||
    query.isRefetching ||
    mutation.isLoading;

  return { query, mutation, isLoading, ...args };
};

const TextField = (props: { entity: string; attribute: string }) => {
  const text = useTextAttribute(props);

  const [timer, setTimer] = useState<any>(undefined);

  const [_value, _setValue] = useState<string | undefined>(undefined);

  const value = _value ?? text.query.data?.value ?? "";

  const setValue = (newValue: string) => {
    _setValue(newValue);
    clearTimeout(timer);
    setTimer(
      setTimeout(async () => {
        await text.mutation.mutateAsync(
          { ...props, value: newValue },
          { onSuccess: () => setTimer(undefined) }
        );
      }, 500)
    );
  };

  const isLoading = text.isLoading || !!timer;

  return (
    <div className="w-full flex flex-col">
      <input
        className="w-full p-4 border border-blue-400 rounded-md rounded-b-none"
        disabled={text.query.isLoading}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <LinearProgress
        indeterminate={isLoading}
        progress={isLoading ? undefined : 1.0}
      />
    </div>
  );
};

const PostTile = (props: { entity: string }) => {
  const { entity } = props;
  return (
    <div className="w-full flex flex-col">
      <TextField entity={entity} attribute="title" />
    </div>
  );
};

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser((user) => {
  const document = "post";

  const [skip, setSkip] = useState(0);

  const take = 4;

  const infiniteBrowse = trpc.useInfiniteQuery(
    [
      "strndb.entity.infiniteBrowse",
      { document, take, orderBy: { createdAt: "desc" } },
    ],
    {
      getNextPageParam: (last) => last.nextCursor,
    }
  );

  const { ref: inViewRef, inView } = useInView();

  const create = trpc.useMutation("strndb.entity.create", {
    onSuccess: async () => {
      await infiniteBrowse.refetch();
    },
  });

  const remove = trpc.useMutation("strndb.entity.remove", {
    onSuccess: async () => {
      await infiniteBrowse.refetch();
    },
  });

  const currentPage = skip / take + 1;

  const isLoading =
    infiniteBrowse.isLoading ||
    infiniteBrowse.isFetching ||
    infiniteBrowse.isRefetching ||
    create.isLoading ||
    remove.isLoading;

  useEffect(() => {
    if (inView) {
      infiniteBrowse.fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="bg-blue-50 py-20 w-full min-h-screen flex flex-col items-center">
      <div className="w-80 flex flex-col space-y-4 items-center">
        <div className="flex flex-row items-center justify-center space-x-4">
          <button
            disabled={isLoading}
            className="w-40 px-4 py-2 bg-black text-white font-bold"
            onClick={async () => {
              await create.mutateAsync({ document });
            }}
          >
            {isLoading ? "LOADING" : "ADD"}
          </button>
        </div>
        <div className="w-full flex flex-col space-y-4">
          {(infiniteBrowse.data?.pages.length ?? 0 < 1) &&
          infiniteBrowse.isLoading ? (
            <div className="w-80 h-80 flex flex-col items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="w-full flex flex-col space-y-4">
              {infiniteBrowse.data?.pages.map((page) => {
                return page.result.map((entity) => {
                  return (
                    <div
                      className="w-full flex flex-col items-start space-y-2"
                      key={entity.id}
                    >
                      <PostTile entity={entity.id} />
                      <button
                        className="px-4 py-2 rounded-md bg-red-500 font-bold text-white"
                        disabled={isLoading}
                        onClick={async () => {
                          await remove.mutateAsync({ id: entity.id });
                        }}
                      >
                        DELETE
                      </button>
                    </div>
                  );
                });
              })}
              <div
                className="w-full flex flex-col items-center"
                ref={inViewRef}
              >
                {infiniteBrowse.hasNextPage && <LoadingSpinner />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
