import styled from "@emotion/styled";
import { RecommendationSettings } from "@lute/domain";
import {
  ActionIcon,
  Button,
  Center,
  Grid,
  Group,
  NumberInput,
  Paper,
  Stack,
  Switch,
  TextInput,
  Title,
} from "@mantine/core";
import { useMemo } from "react";
import { useForm } from "@mantine/form";
import { Panel } from "../Panel";
import { CollapsibleSection } from "./CollapsibleSection";
import { IconCircleMinus, IconTrash } from "@tabler/icons";

const getValueByPath = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc[key], obj);

export type RecommendationSettingsForm = RecommendationSettings & {
  profileId: string;
};

interface RecommendationSettingsPaneProps {
  defaultSettings: RecommendationSettingsForm;
  onSubmit: (settings: RecommendationSettingsForm) => void;
}

const AlignRight = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const FilterInputs = ({
  value,
  getProps,
  onRemove,
}: {
  value: string[];
  getProps: (index: number) => any;
  onRemove: (index: number) => void;
}) => (
  <>
    {value.map((filter, index) => (
      <Group key={index}>
        <TextInput value={filter} {...getProps(index)} />
        <ActionIcon onClick={() => onRemove(index)} color="red">
          <IconCircleMinus size={16} />
        </ActionIcon>
      </Group>
    ))}
  </>
);

const FilterSection = ({
  form,
  path,
  title,
}: {
  form: ReturnType<typeof useForm<RecommendationSettingsForm>>;
  path: string;
  title: string;
}) => (
  <CollapsibleSection title={title}>
    <Stack>
      <FilterInputs
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
                      {...form.getInputProps(
                        "assessmentSettings.noveltyFactor"
                      )}
                    />
                  </div>
                  <div>
                    <Switch
                      label="Use Album Weight"
                      {...form.getInputProps(
                        "assessmentSettings.useAlbumWeight",
                        {
                          type: "checkbox",
                        }
                      )}
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
                          "assessmentSettings.parameterWeights.primaryGenres"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Secondary Genres"
                        name="assessmentSettings.parameterWeights.secondaryGenres"
                        placeholder="Secondary Genres"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "assessmentSettings.parameterWeights.secondaryGenres"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Primary Cross Genres"
                        name="assessmentSettings.parameterWeights.primaryCrossGenres"
                        placeholder="P. Cross Genres"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "assessmentSettings.parameterWeights.primaryCrossGenres"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="2-ary Cross Genres"
                        name="assessmentSettings.parameterWeights.secondaryCrossGenres"
                        placeholder="S. Cross Genres"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "assessmentSettings.parameterWeights.secondaryCrossGenres"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Rating"
                        name="assessmentSettings.parameterWeights.rating"
                        placeholder="Rating"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "assessmentSettings.parameterWeights.rating"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Rating Count"
                        name="assessmentSettings.parameterWeights.ratingCount"
                        placeholder="Rating"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "assessmentSettings.parameterWeights.ratingCount"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <NumberInput
                        label="Descriptors"
                        name="assessmentSettings.parameterWeights.descriptors"
                        placeholder="Descriptors"
                        variant="filled"
                        min={0}
                        max={100}
                        step={1}
                        {...form.getInputProps(
                          "assessmentSettings.parameterWeights.descriptors"
                        )}
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </CollapsibleSection>
              <CollapsibleSection title="Filter Settings">
                <Stack spacing="sm" px="lg">
                  <FilterSection
                    form={form}
                    path="filter.primaryGenres"
                    title="Included Primary Genres"
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
                  />
                  <FilterSection
                    form={form}
                    path="filter.excludeSecondaryGenres"
                    title="Exclude Secondary Genres"
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
