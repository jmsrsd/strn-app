import LinearProgress from '@material/react-linear-progress';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import LoadingSpinner from '~/components/LoadingSpinner';
import { trpc } from '~/utils/trpc';
import { strict } from '~/utils/user';

const useText = (args: { entity: string; attribute: string }) => {
  const utils = trpc.useContext();

  const query = trpc.useQuery(["strndb.text.get", args]);

  const refresh = async () => {
    await utils.cancelQuery(["strndb.text.get"]);
    await utils.invalidateQueries(["strndb.text.get"]);
    await query.refetch();
  };

  const mutation = trpc.useMutation(["strndb.text.set"], {
    onMutate: async () => {
      await refresh();
    },
    onSuccess: async () => {
      await refresh();
    },
  });

  const isLoading =
    query.isLoading ||
    query.isFetching ||
    query.isRefetching ||
    mutation.isLoading;

  return { query, mutation, isLoading, ...args };
};

const TextField = (props: {
  label: string;
  entity: string;
  attribute: string;
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const { ref: inViewRef, inView } = useInView();

  const text = useText(props);

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
          {
            onSuccess: () => {
              setTimer(undefined);
            },
          }
        );
      }, 500)
    );
  };

  const isLoading = text.isLoading || !!timer;

  useEffect(() => {
    if (!!textAreaRef.current) {
      textAreaRef.current.style.height = `0px`;
      textAreaRef.current.style.height = `${
        textAreaRef.current.scrollHeight + 2
      }px`;
    }
  }, [value]);

  useEffect(() => {
    if (inView) {
      text.query.refetch().then(() => {
        _setValue(undefined);
      });
    }
  }, [inView]);

  return (
    <div className="w-full flex flex-col space-y-2" ref={inViewRef}>
      <div className="font-semibold text-sm">{props.label}</div>
      <div className="w-full flex flex-col">
        <textarea
          ref={textAreaRef}
          className="resize-none w-full p-4 border border-blue-400 rounded-md rounded-b-none"
          disabled={text.query.isLoading}
          value={value}
          placeholder={text.query.isLoading ? "Loading..." : "..."}
          onChange={(e) => setValue(e.target.value)}
          rows={1}
        />
        <LinearProgress
          indeterminate={isLoading}
          progress={isLoading ? undefined : 1.0}
        />
      </div>
    </div>
  );
};

const PostTile = (props: { entity: string }) => {
  const { entity } = props;
  return (
    <div className="w-full flex flex-col space-y-4">
      <TextField entity={entity} label="Title" attribute="title" />
      <TextField entity={entity} label="Content" attribute="content" />
    </div>
  );
};

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser((user) => {
  const _document = "post";

  const utils = trpc.useContext();

  const browse = trpc.useInfiniteQuery(
    [
      "strndb.entity.browse",
      { document: _document, take: 10, orderBy: { createdAt: "desc" } },
    ],
    { getNextPageParam: (last) => last.next }
  );

  const refresh = async () => {
    await utils.cancelQuery(["strndb.entity.browse"]);
    await utils.invalidateQueries(["strndb.entity.browse"]);
    await browse.refetch();
  };

  const create = trpc.useMutation("strndb.entity.create", {
    onMutate: async () => {
      await refresh();
    },
    onSuccess: async () => {
      await refresh();
    },
  });

  const createEntity = async (document: string) => {
    await create.mutateAsync(
      { document },
      {
        onError: async () => {
          await createEntity(document);
        },
      }
    );
  };

  const remove = trpc.useMutation("strndb.entity.remove", {
    onMutate: async () => {
      await refresh();
    },
    onSuccess: async () => {
      await refresh();
    },
  });

  const removeEntity = async (id: string) => {
    await remove.mutateAsync(
      { id },
      {
        onError: async () => {
          await removeEntity(id);
        },
      }
    );
  };

  const isLoading =
    browse.isLoading ||
    browse.isFetching ||
    browse.isRefetching ||
    create.isLoading ||
    remove.isLoading;

  const { ref: bottomInViewRef, inView: bottomInView } = useInView();
  const { ref: topInViewRef, inView: topInView } = useInView();

  useEffect(() => {
    if (bottomInView) {
      browse.fetchNextPage().then(async () => {
        await refresh();
      });
    }

    if (topInView) {
      refresh();
    }
  }, [bottomInView, topInView]);

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "unset";
  }, [isLoading]);

  return (
    <div className="bg-blue-50 py-20 w-full min-h-screen flex flex-col items-center">
      <div className="w-80 flesx flex-col space-y-16 items-center">
        {(!!browse.error || !!create.error || !!remove.error) && (
          <div className="p-4 rounded-md flex flex-col items-center text-center bg-yellow-500 text-black font-bold space-y-4">
            {[
              browse.error?.message,
              create.error?.message,
              remove.error?.message,
            ].map((message, i) => {
              return <div key={i}>{message}</div>;
            })}
          </div>
        )}
        <div className="flex flex-row items-center justify-center space-x-4">
          <button
            ref={topInViewRef}
            disabled={isLoading}
            className="rounded-md w-40 px-4 py-2 bg-black text-white font-bold disabled:bg-white disabled:text-black duration-300"
            onClick={async () => {
              await createEntity(_document);
            }}
          >
            {isLoading ? "LOADING" : "ADD"}
          </button>
        </div>
        <div className="w-full flex flex-col space-y-4">
          {isLoading && (browse.data?.pages.length ?? 0) < 1 ? (
            <div className="w-full flex flex-col items-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="w-full flex flex-col space-y-16">
              {browse.data?.pages.map((page) => {
                return page.result.map((entity) => {
                  return (
                    <div
                      className="w-full flex flex-col items-start space-y-4"
                      key={entity.id}
                    >
                      <PostTile entity={entity.id} />
                      <div className="w-full flex flex-col items-start text-gray-600 font-bold text-sm space-y-4 font-mono">
                        <div className="flex flex-col">
                          <div>ID</div>
                          <div>{`# ${entity.id}`}</div>
                        </div>
                        <div className="flex flex-col">
                          <div>Created</div>
                          <div>{`@ ${entity.createdAt.toISOString()}`}</div>
                        </div>
                        <div className="flex flex-col">
                          <div>Updated</div>
                          <div>{`@ ${entity.updatedAt.toISOString()}`}</div>
                        </div>
                      </div>
                      <button
                        className="px-4 py-2 rounded-md bg-red-500 font-bold text-white disabled:bg-white disabled:text-red-500 duration-300"
                        disabled={isLoading}
                        onClick={async () => {
                          await removeEntity(entity.id);
                        }}
                      >
                        {isLoading ? "LOADING" : "DELETE"}
                      </button>
                    </div>
                  );
                });
              })}
              <div
                className="w-full flex flex-col items-center"
                ref={bottomInViewRef}
              >
                {browse.hasNextPage && <LoadingSpinner />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
