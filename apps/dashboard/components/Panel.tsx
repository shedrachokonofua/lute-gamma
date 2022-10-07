import { Paper } from "@mantine/core";
import { FC } from "react";

export const Panel: FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <Paper p="md" shadow="xs" radius="sm">
    {children}
  </Paper>
);
