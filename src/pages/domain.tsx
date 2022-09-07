import { LegacyRef, useRef } from "react";
import LoadingSpinner from "~/components/LoadingSpinner";
import { trpc } from "~/utils/trpc";
import { strict } from "~/utils/user";

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser((user) => {
  const keys = trpc.useQuery(["domain.keys"]);
  const add = trpc.useMutation(["domain.add"], {
    onSuccess: async (id) => {
      await keys.refetch();
    },
  });
  const isLoading = keys.isLoading || add.isLoading;
  const keyInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w min-h-screen flex flex-col items-center justify-center">
      <div className="w-80 flex flex-col space-y-8">
        <form
          className="flex flex-col space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const key = keyInputRef.current?.value;
            if (!key) return;
            await add.mutateAsync(key);
            keyInputRef.current.value = "";
          }}
        >
          <input
            className="border border-black"
            type="text"
            ref={keyInputRef}
            required
          />
          {isLoading ? (
            <div className="flex flex-row justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <button type="submit">ADD KEY</button>
          )}
        </form>
        <div className="flex flex-col space-y-2">
          {keys.isLoading
            ? "Loading..."
            : keys.data?.map((key, i) => {
                return <div key={i}>{key}</div>;
              })}
        </div>
      </div>
    </div>
  );
});
