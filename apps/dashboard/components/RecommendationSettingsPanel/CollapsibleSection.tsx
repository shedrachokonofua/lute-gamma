import { Button, Collapse } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons";
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
  const Icon = isOpen ? IconChevronUp : IconChevronDown;

  return (
    <div>
      <Button
        rightIcon={<Icon size={16} />}
        onClick={() => setIsOpen(!isOpen)}
        variant="light"
        compact
        fullWidth
      >
        {`${isOpen ? "Hide" : "Show"} ${title}`}
      </Button>
      <Collapse in={isOpen}>
        <div
          style={{
            padding: "0.75rem 0.5rem",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </Collapse>
    </div>
  );
};
