import {
  Card,
  Elevation,
  FormGroup,
  InputGroup,
  NumericInput,
  Button,
  Switch,
} from "@blueprintjs/core";
import styled from "@emotion/styled";
import { RecommendationSettings } from "@lute/domain";
import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Grid } from "../Grid";
import { Heading } from "../Heading";
import { HStack, VStack } from "../Stack";
import { CollapsibleSection } from "./CollapsibleSection";

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

export const RecommendationSettingsPanel = ({
  defaultSettings,
  onSubmit,
}: RecommendationSettingsPaneProps) => {
  const { control, handleSubmit } = useForm<RecommendationSettingsForm>({
    defaultValues: defaultSettings,
  });

  return (
    <Card
      elevation={Elevation.ONE}
      style={{
        minWidth: 360,
      }}
    >
      <VStack>
        <Heading level={5}>Recommendation Settings</Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap="lg">
            <VStack gap="sm">
              <FormGroup label="Profile ID" labelFor="profile-id">
                <Controller
                  name="profileId"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <InputGroup
                      id="profile-id"
                      placeholder="Profile ID"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </FormGroup>
              <FormGroup label="Recommendations Count" labelFor="count">
                <Controller
                  name="count"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <NumericInput
                      id="count"
                      placeholder="Recommendations Count"
                      value={value}
                      onValueChange={onChange}
                      min={1}
                      max={100}
                    />
                  )}
                />
              </FormGroup>
              <CollapsibleSection title="Assessment Settings">
                <VStack gap="sm">
                  <FormGroup label="Novelty Factor" labelFor="noveltyFactor">
                    <Controller
                      name="assessmentSettings.noveltyFactor"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <NumericInput
                          id="count"
                          placeholder="Novelty Factor"
                          value={value}
                          onValueChange={onChange}
                          style={{ width: "100px" }}
                          minorStepSize={0.01}
                          stepSize={0.01}
                          min={0}
                          max={1}
                        />
                      )}
                    />
                  </FormGroup>
                  <Controller
                    name="assessmentSettings.useAlbumWeight"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        label="Weight albums"
                        checked={value}
                        onChange={onChange}
                        id="useAlbumWeight"
                      />
                    )}
                  />
                  <div>
                    <Heading level={6}>Parameter Weights</Heading>
                    <Grid cols={2}>
                      <FormGroup
                        label="Descriptors"
                        labelFor="parameterWeights.descriptors"
                      >
                        <Controller
                          name="assessmentSettings.parameterWeights.descriptors"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <NumericInput
                              id="count"
                              placeholder="Descriptors"
                              value={value}
                              onValueChange={onChange}
                              style={{ width: "100px" }}
                              minorStepSize={1}
                              min={0}
                              max={100}
                            />
                          )}
                        />
                      </FormGroup>

                      <FormGroup
                        label="Primary Genres"
                        labelFor="parameterWeights.primaryGenres"
                      >
                        <Controller
                          name="assessmentSettings.parameterWeights.primaryGenres"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <NumericInput
                              id="parameterWeights.primaryGenres"
                              placeholder="Primary Genres"
                              value={value}
                              onValueChange={onChange}
                              style={{ width: "100px" }}
                              minorStepSize={1}
                              min={0}
                              max={100}
                            />
                          )}
                        />
                      </FormGroup>

                      <FormGroup
                        label="Secondary Genres"
                        labelFor="parameterWeights.secondaryGenres"
                      >
                        <Controller
                          name="assessmentSettings.parameterWeights.secondaryGenres"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <NumericInput
                              id="parameterWeights.secondaryGenres"
                              placeholder="Secondary Genres"
                              value={value}
                              onValueChange={onChange}
                              style={{ width: "100px" }}
                              minorStepSize={1}
                              min={0}
                              max={100}
                            />
                          )}
                        />
                      </FormGroup>

                      <FormGroup
                        label="Primary Cross Genres"
                        labelFor="parameterWeights.primaryCrossGenres"
                      >
                        <Controller
                          name="assessmentSettings.parameterWeights.primaryCrossGenres"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <NumericInput
                              id="parameterWeights.primaryCrossGenres"
                              placeholder="Primary Cross Genres"
                              value={value}
                              onValueChange={onChange}
                              style={{ width: "100px" }}
                              minorStepSize={1}
                              min={0}
                              max={100}
                            />
                          )}
                        />
                      </FormGroup>

                      <FormGroup
                        label="2-ary Cross Genres"
                        labelFor="parameterWeights.secondaryCrossGenres"
                      >
                        <Controller
                          name="assessmentSettings.parameterWeights.secondaryCrossGenres"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <NumericInput
                              id="parameterWeights.secondaryCrossGenres"
                              placeholder="Secondary Cross Genres"
                              value={value}
                              onValueChange={onChange}
                              style={{ width: "100px" }}
                              minorStepSize={1}
                              min={0}
                              max={100}
                            />
                          )}
                        />
                      </FormGroup>

                      <FormGroup
                        label="Rating"
                        labelFor="parameterWeights.rating"
                      >
                        <Controller
                          name="assessmentSettings.parameterWeights.rating"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <NumericInput
                              id="parameterWeights.rating"
                              placeholder="Rating"
                              value={value}
                              onValueChange={onChange}
                              style={{ width: "100px" }}
                              minorStepSize={1}
                              min={0}
                              max={100}
                            />
                          )}
                        />
                      </FormGroup>

                      <FormGroup
                        label="Rating Count"
                        labelFor="parameterWeights.ratingCount"
                      >
                        <Controller
                          name="assessmentSettings.parameterWeights.ratingCount"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <NumericInput
                              id="parameterWeights.ratingCount"
                              placeholder="Rating Count"
                              value={value}
                              onValueChange={onChange}
                              style={{ width: "100px" }}
                              minorStepSize={1}
                              min={0}
                              max={100}
                            />
                          )}
                        />
                      </FormGroup>
                    </Grid>
                  </div>
                </VStack>
              </CollapsibleSection>
              <CollapsibleSection title="Filters">Filters</CollapsibleSection>
            </VStack>
            <div>
              <Button text="Submit" type="submit" />
            </div>
          </VStack>
        </form>
      </VStack>
    </Card>
  );
};
