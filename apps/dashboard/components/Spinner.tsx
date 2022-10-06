import styled from "@emotion/styled";

export const Spinner = styled.div`
  display: inline-block;
  width: 48px;
  height: 48px;
  position: relative;
  border: 3px solid #ccc;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: lds-dual-ring 1.2s linear infinite;
  @keyframes lds-dual-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
