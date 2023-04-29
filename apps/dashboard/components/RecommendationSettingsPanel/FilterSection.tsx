import {
  Group,
  Autocomplete,
  TextInput,
  ActionIcon,
  Stack,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCircleMinus } from "@tabler/icons";
import { CollapsibleSection } from "./CollapsibleSection";
import { RecommendationSettingsForm } from "./RecommendationSettingsPanel";

const getValueByPath = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc[key], obj);

const FilterInputs = ({
  value,
  getProps,
  onRemove,
  options,
}: {
  value: string[];
  getProps: (index: number) => any;
  onRemove: (index: number) => void;
  options?: string[];
}) => (
  <>
    {value.map((filter, index) => {
      const inputProps = {
        ...getProps(index),
        value: filter,
        variant: "filled",
        sx: {
          width: "160px",
        },
      };

      return (
        <Group key={index}>
          {options?.length ? (
            <Autocomplete {...inputProps} data={options} limit={10} />
          ) : (
            <TextInput {...inputProps} />
          )}
          <ActionIcon onClick={() => onRemove(index)} color="red">
            <IconCircleMinus size={16} />
          </ActionIcon>
        </Group>
      );
    })}
  </>
);

export const FilterSection = ({
  form,
  path,
  title,
  options,
}: {
  form: ReturnType<typeof useForm<RecommendationSettingsForm>>;
  path: string;
  title: string;
  options?: string[];
}) => (
  <CollapsibleSection title={title}>
    <Stack>
      <FilterInputs
        options={options}
        value={getValueByPath(form.values, path)}
        getProps={(index) => form.getInputProps(`${path}.${index}`)}
        onRemove={(index) => form.removeListItem(path, index)}
      />
      <Button onClick={() => form.insertListItem(path, "")}>Add Item</Button>
    </Stack>
  </CollapsibleSection>
);
