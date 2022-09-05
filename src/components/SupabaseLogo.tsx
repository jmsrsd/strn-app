import Image from "next/image";

const SupabaseLogo = (props: any) => {
  return (
    <a {...{ ...props, href: "https://supabase.com/" }}>
      <div className="bg-gray-900 h-10 px-4 rounded-md flex flex-col justify-center">
        <Image
          alt="supabase"
          src="https://supabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsupabase-logo-wordmark--dark.53d797e9.png&w=128&q=75"
          width={128}
          height={24}
        />
      </div>
    </a>
  );
};

export default SupabaseLogo;
