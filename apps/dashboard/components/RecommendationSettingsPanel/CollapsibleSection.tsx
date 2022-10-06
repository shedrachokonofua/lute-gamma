import { Button, Collapse } from "@blueprintjs/core";
import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

export const CollapsibleSection = ({
  title,
  children,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        rightIcon={isOpen ? "caret-up" : "caret-down"}
        text={`${isOpen ? "Hide" : "Show"} ${title}`}
        onClick={() => setIsOpen(!isOpen)}
        fill
      />
      <Collapse isOpen={isOpen}>
        <div
          style={{
            padding: "1rem 0.5rem",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </Collapse>
    </div>
  );
};
