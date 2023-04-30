import {
  AlbumRecommendationParameters,
  AlbumRecommendationPreset,
  ProfileDTO,
} from "@lute/domain";
import {
  Button,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { UseFormReturnType } from "@mantine/form";
import { FormEvent, useState } from "react";
import { useRefreshData } from "../../hooks";
import { Panel } from "../Panel";
import { CollapsibleSection } from "./CollapsibleSection";
import { LoadPresetModal } from "./LoadPresetModal";
import { FilterSection } from "./FilterSection";
import { SavePresetModal } from "./SavePresetModal";

export type RecommendationSettingsForm = Omit<
  AlbumRecommendationParameters,
  "model"
>;

interface RecommendationSettingsPaneProps {
  form: UseFormReturnType<RecommendationSettingsForm>;
  onSubmit: (e?: FormEvent<HTMLFormElement>) => void;
  genreOptions?: string[];
  profiles: ProfileDTO[];
  albumRecommendationPresets: AlbumRecommendationPreset[];
}

export const RecommendationSettingsPanel = ({
  form,
  onSubmit,
  genreOptions,
  profiles,
  albumRecommendationPresets,
}: RecommendationSettingsPaneProps) => {
  const refreshData = useRefreshData();
  const [
    isLoadPresetModalOpen,
    { open: openLoadPresetModal, close: closeLoadPresetModal },
  ] = useDisclosure(false);
  const [
    isSavePresetModalOpen,
    { open: openSavePresetModal, close: closeSavePresetModal },
  ] = useDisclosure(false);
  const [mostRecentPreset, setMostRecentPreset] = useState<
    AlbumRecommendationPreset | undefined
  >(undefined);

  const onLoadPreset = (preset: AlbumRecommendationPreset) => {
    const next = {
      ...form.values,
      filter: preset.filter,
      settings: preset.settings,
    };
    form.setValues(next);
    setMostRecentPreset(preset);
    onSubmit();
  };

  const onSavePreset = () => {
    refreshData();
  };

  return (
    <>
      <LoadPresetModal
        albumRecommendationPresets={albumRecommendationPresets}
        isOpen={isLoadPresetModalOpen}
        onClose={closeLoadPresetModal}
        onSubmit={onLoadPreset}
      />
      <SavePresetModal
        albumRecommendationPresets={albumRecommendationPresets}
        mostRecentPreset={mostRecentPreset}
        isOpen={isSavePresetModalOpen}
        onSubmit={onSavePreset}
        onClose={closeSavePresetModal}
        filter={form.values.filter}
        settings={form.values.settings}
      />

      <Panel>
        <Stack spacing="lg">
          <Title order={4}>Settings</Title>
          <form onSubmit={onSubmit}>
            <Stack spacing="xl">
              <Stack spacing="sm">
                <Select
                  label="Profile"
                  data={profiles.map((profile) => ({
                    label: profile.title,
                    value: profile.id,
                  }))}
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
                <Group grow>
                  <Button
                    compact
                    variant="gradient"
                    gradient={{ from: "teal", to: "blue", deg: 60 }}
                    onClick={openLoadPresetModal}
                  >
                    Load Preset
                  </Button>
                  <Button
                    compact
                    variant="gradient"
                    gradient={{ from: "teal", to: "blue", deg: 60 }}
                    onClick={openSavePresetModal}
                  >
                    Save Preset
                  </Button>
                </Group>
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
                      title="Excluded Albums"
                    />
                    <FilterSection
                      form={form}
                      path="filter.excludeArtists"
                      title="Excluded Artists"
                    />
                    <FilterSection
                      form={form}
                      path="filter.excludePrimaryGenres"
                      title="Excluded Primary Genres"
                      options={genreOptions}
                    />
                    <FilterSection
                      form={form}
                      path="filter.excludeSecondaryGenres"
                      title="Excluded Secondary Genres"
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
    </>
  );
};
