import { useRef } from "react";
import LoadingSpinner from "~/components/LoadingSpinner";
import { trpc } from "~/utils/trpc";
import { strict } from "~/utils/user";

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser((user, slug) => {
  const keys = trpc.useQuery(["domain.keys"]);
  const add = trpc.useMutation(["domain.add"], {
    onSuccess: async (id) => {
      await keys.refetch();
    },
  });
  const remove = trpc.useMutation(["domain.remove"], {
    onSuccess: async () => {
      await keys.refetch();
    },
  });
  const isLoading = keys.isLoading || add.isLoading || remove.isLoading;
  const keyInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="w-80 flex flex-col space-y-8">
        <form
          className="flex flex-col space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const key = keyInputRef.current?.value;
            if (!key) return;
            await add.mutateAsync({ key });
            keyInputRef.current.value = "";
          }}
        >
          <input
            className="border border-black"
            type="text"
            ref={keyInputRef}
            required
          />
          {isLoading
            ? (
              <div className="flex flex-row justify-center">
                <LoadingSpinner />
              </div>
            )
            : (
              <button className="bg-black text-white font-bold" type="submit">
                ADD KEY
              </button>
            )}
        </form>
        <div className="flex flex-col space-y-2">
          {keys.isLoading
            ? "Loading..."
            : keys.data?.map((key, i) => {
              return (
                <div className="flex flex-row" key={i}>
                  <div className="flex-auto">{key}</div>
                  <button
                    onClick={async () => {
                      await remove.mutateAsync({ key });
                    }}
                    disabled={remove.isLoading}
                  >
                    ❌
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
});
