import styled from "@emotion/styled";

interface GridProps {
  cols?: number;
}

export const Grid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols || 1}, 1fr);
`;
