import { useRouter } from "next/router";

export const useRefreshData = () => {
  const router = useRouter();

  return () => {
    router.replace(router.asPath);
  };
};
