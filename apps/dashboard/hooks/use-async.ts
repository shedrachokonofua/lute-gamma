import { DependencyList, useCallback, useEffect, useState } from "react";

type AsyncStatus = "idle" | "pending" | "success" | "error";

export const useAsync = <T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  deps: DependencyList = [],
  immediate = true
) => {
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback((...args: any[]) => {
    setStatus("pending");
    setValue(null);
    setError(null);

    return asyncFunction(...args)
      .then((response) => {
        setValue(response);
        setStatus("success");
      })
      .catch((error) => {
        setError(error);
        setStatus("error");
      });
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
};
