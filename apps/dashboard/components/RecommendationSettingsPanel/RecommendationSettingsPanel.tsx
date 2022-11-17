import styled from "@emotion/styled";
import { RecommendationParameters } from "@lute/domain";
import {
  ActionIcon,
  Autocomplete,
  Button,
  Grid,
  Group,
  NumberInput,
  Stack,
  Switch,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Panel } from "../Panel";
import { CollapsibleSection } from "./CollapsibleSection";
import { IconCircleMinus } from "@tabler/icons";

const getValueByPath = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc[key], obj);

export type RecommendationSettingsForm = Omit<
  RecommendationParameters,
  "model"
>;

interface RecommendationSettingsPaneProps {
  defaultSettings: RecommendationSettingsForm;
  onSubmit: (settings: RecommendationSettingsForm) => void;
  genreOptions?: string[];
}

const AlignRight = styled.div`
  display: flex;
  justify-content: flex-end;
`;

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

const FilterSection = ({
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

export const RecommendationSettingsPanel = ({
  defaultSettings,
  onSubmit,
  genreOptions,
}: RecommendationSettingsPaneProps) => {
  const form = useForm<RecommendationSettingsForm>({
    initialValues: defaultSettings,
  });
  const handleSubmit = form.onSubmit((values) => onSubmit(values));

  return (
    <Panel>
      <Stack spacing="lg">
        <Title order={4}>Settings</Title>
        <form onSubmit={handleSubmit}>
          <Stack spacing="xl">
            <Stack spacing="sm">
              <TextInput
                label="Profile ID"
                placeholder="Profile ID"
                variant="filled"
                {...form.getInputProps("profileId")}
              />
              <NumberInput
                label="Recommendations Count"
                placeholder="Recommendations Count"
                variant="filled"
                min={1}
                max={100}
                {...form.getInputProps("count")}
              />
              <CollapsibleSection title="Assessment Settings">
                <Stack spacing="md">
                  <div>
                    <NumberInput
                      label="Novelty Factor"
                      placeholder="Novelty Factor"
                      variant="filled"
                      min={0}
                      max={1}
                      step={0.1}
                      precision={1}
                      {...form.getInputProps("settings.noveltyFactor")}
                    />
                  </div>
                  <div>
                    <Switch
                      label="Use Album Weight"
                      {...form.getInputProps("settings.useAlbumWeight", {
                        type: "checkbox",
                      })}
                    />
                  </div>
                  <Title order={6}>Parameter Weights</Title>
                  <Grid gutter="xs">
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Primary Genres"
                        placeholder="Primary Genres"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "settings.parameterWeights.primaryGenres"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Secondary Genres"
                        name="settings.parameterWeights.secondaryGenres"
                        placeholder="Secondary Genres"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "settings.parameterWeights.secondaryGenres"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Pr. Cross Genres"
                        name="settings.parameterWeights.primaryCrossGenres"
                        placeholder="P. Cross Genres"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "settings.parameterWeights.primaryCrossGenres"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="2-ary Cross Genres"
                        name="settings.parameterWeights.secondaryCrossGenres"
                        placeholder="S. Cross Genres"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "settings.parameterWeights.secondaryCrossGenres"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Rating"
                        name="settings.parameterWeights.rating"
                        placeholder="Rating"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "settings.parameterWeights.rating"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Rating Count"
                        name="settings.parameterWeights.ratingCount"
                        placeholder="Rating"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "settings.parameterWeights.ratingCount"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Descriptors"
                        name="settings.parameterWeights.descriptors"
                        placeholder="Descriptors"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "settings.parameterWeights.descriptors"
                        )}
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </CollapsibleSection>
              <CollapsibleSection title="Filter Settings">
                <Stack spacing="sm" px="md">
                  <FilterSection
                    form={form}
                    path="filter.primaryGenres"
                    title="Included Primary Genres"
                    options={genreOptions}
                  />
                  <FilterSection
                    form={form}
                    path="filter.excludeAlbums"
                    title="Exclude Albums"
                  />
                  <FilterSection
                    form={form}
                    path="filter.excludeArtists"
                    title="Exclude Artists"
                  />
                  <FilterSection
                    form={form}
                    path="filter.excludePrimaryGenres"
                    title="Exclude Primary Genres"
                    options={genreOptions}
                  />
                  <FilterSection
                    form={form}
                    path="filter.excludeSecondaryGenres"
                    title="Exclude Secondary Genres"
                    options={genreOptions}
                  />
                </Stack>
              </CollapsibleSection>
            </Stack>
            <div>
              <Button type="submit">Submit</Button>
            </div>
          </Stack>
        </form>
      </Stack>
    </Panel>
  );
};
