import styled from "@emotion/styled";

type Gap = "sm" | "md" | "lg" | "xl";

const gapRem = {
  sm: 0.5,
  md: 1,
  lg: 2,
  xl: 3,
};

interface StackProps {
  gap?: Gap;
}

const getGap = ({ gap }: StackProps) => gapRem[gap || "md"] + "rem";

export const VStack = styled.div<StackProps>`
  display: flex;
  flex-direction: column;
  gap: ${getGap};
`;

export const HStack = styled.div<StackProps>`
  display: flex;
  flex-direction: row;
  gap: ${getGap};
`;
