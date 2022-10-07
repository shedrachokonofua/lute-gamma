import type { NextPage } from "next";
import { useAsync } from "../hooks/use-async";
import { profileClient } from "../clients";
import {
  Header,
  Container,
  Stack,
  Grid,
  Title,
  Text,
  Badge,
  Group,
} from "@mantine/core";
import {
  Panel,
  RecommendationSettingsForm,
  RecommendationSettingsPanel,
  Spinner,
} from "../components";
import React, { useCallback, useEffect, useState } from "react";
import { IconPlayerTrackNext } from "@tabler/icons";

const useRecommendations = () => {
  const request = useCallback((settingsForm: RecommendationSettingsForm) => {
    const { profileId, ...settings } = settingsForm;
    return profileClient.getRecommendations(profileId, settings);
  }, []);

  return useAsync(request, false);
};

const defaultRecommendationSettings = {
  profileId: "default",
  count: 10,
  assessmentSettings: {
    noveltyFactor: 0.5,
    useAlbumWeight: true,
    parameterWeights: {
      primaryGenres: 5,
      secondaryGenres: 3,
      primaryCrossGenres: 2,
      secondaryCrossGenres: 1,
      descriptors: 10,
      rating: 2,
      ratingCount: 1,
    },
  },
  filter: {
    excludeAlbums: [],
    excludeArtists: [],
    primaryGenres: [],
    excludePrimaryGenres: [],
    secondaryGenres: [],
    excludeSecondaryGenres: [],
  },
} as RecommendationSettingsForm;

const getInitialRecommendationSettings = async () => {
  const settings = localStorage.getItem("settings");
  return settings ? JSON.parse(settings) : defaultRecommendationSettings;
};

const useInitialSettings = () => useAsync(getInitialRecommendationSettings);

const Home: NextPage = () => {
  const { status: initialSettingsStatus, value: initialSettings } =
    useInitialSettings();
  const [settingsFormValue, setSettingsFormValue] = useState<
    RecommendationSettingsForm | undefined
  >(undefined);

  const {
    status: recommendationStatus,
    value: recommendations,
    execute,
  } = useRecommendations();

  useEffect(() => {
    if (initialSettingsStatus === "success" && !settingsFormValue) {
      setSettingsFormValue(initialSettings);
    }
  }, [initialSettings, initialSettingsStatus, settingsFormValue]);

  useEffect(() => {
    if (settingsFormValue) {
      localStorage.setItem("settings", JSON.stringify(settingsFormValue));
      execute(settingsFormValue);
    }
  }, [execute, settingsFormValue]);

  return (
    <main>
      <Header
        height={60}
        sx={(theme) => ({
          boxShadow: theme.shadows.xs,
        })}
      >
        <Container size="lg" sx={{ height: "100%" }}>
          <Group align="center" spacing="xs" sx={{ height: "100%" }}>
            <IconPlayerTrackNext />
            <Title order={1} size="h3" weight="normal">
              Lute
            </Title>
          </Group>
        </Container>
      </Header>
      <Container size="lg" py="lg">
        {initialSettingsStatus === "pending" && <Spinner />}
        {initialSettingsStatus === "success" && initialSettings && (
          <Grid>
            <Grid.Col md={4}>
              <RecommendationSettingsPanel
                defaultSettings={initialSettings}
                onSubmit={setSettingsFormValue}
              />
            </Grid.Col>
            <Grid.Col md={8}>
              <Panel>
                <Stack spacing="md">
                  <Title order={4}>Recommendations</Title>
                  {recommendationStatus === "pending" && (
                    <div>
                      <Spinner />
                    </div>
                  )}
                  {recommendationStatus === "success" && (
                    <Grid gutter="xl">
                      {recommendations &&
                        recommendations.map((recommendation) => (
                          <React.Fragment key={recommendation.album.fileName}>
                            <Grid.Col xs={10}>
                              <Group spacing="xs">
                                <Text
                                  size="xl"
                                  color="blue"
                                  sx={{
                                    ":hover": {
                                      textDecoration: "underline",
                                    },
                                  }}
                                >
                                  <a
                                    href={
                                      "http://rateyourmusic.com/" +
                                      recommendation.album.fileName
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {decodeURI(recommendation.album.name)}
                                  </a>
                                </Text>
                                <Badge>{recommendation.album.rating} / 5</Badge>
                              </Group>
                              <div>
                                <Text size="lg" weight="bold">
                                  {recommendation.album.artists.join(", ")}
                                </Text>
                              </div>
                              <div>
                                <Text>
                                  {recommendation.album.primaryGenres.join(
                                    ", "
                                  )}
                                </Text>
                              </div>
                              <div>
                                <Text size="md">
                                  {recommendation.album.secondaryGenres.join(
                                    ", "
                                  )}
                                </Text>
                              </div>
                              <div>
                                <Text size="sm" color="gray">
                                  {recommendation.album.descriptors.join(", ")}
                                </Text>
                              </div>
                            </Grid.Col>
                            <Grid.Col xs={2}>
                              <Text size="xl" weight="bold">
                                {(
                                  recommendation.assessment.averageQuantile *
                                  100
                                ).toFixed(1)}
                                %
                              </Text>
                            </Grid.Col>
                          </React.Fragment>
                        ))}
                    </Grid>
                  )}
                </Stack>
              </Panel>
            </Grid.Col>
          </Grid>
        )}
      </Container>
    </main>
  );
};

export default Home;
