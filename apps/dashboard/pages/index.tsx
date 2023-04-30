import type { NextPage } from "next";
import { Container, Stack, Grid, Title } from "@mantine/core";
import {
  PageHeader,
  Panel,
  Recommendations,
  RecommendationSettingsForm,
  RecommendationSettingsPanel,
  Spinner,
} from "../components";
import { useEffect, useState } from "react";
import { useInitialSettings } from "../hooks/use-initial-settings";
import { useRecommendations } from "../hooks/use-recommendations";
import { api } from "../api";
import {
  AlbumDocument,
  AlbumRecommendationPreset,
  ProfileDTO,
} from "@lute/domain";

export interface HomeProps {
  genreOptions: string[];
  profiles: ProfileDTO[];
  albumRecommendationPresets: AlbumRecommendationPreset[];
}

const Home: NextPage<HomeProps> = ({
  genreOptions,
  profiles,
  albumRecommendationPresets,
}) => {
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

  const findSimilarAlbums = (album: AlbumDocument) => {
    setSettingsFormValue((value) => {
      if (!value || !album.primaryGenres || !album.secondaryGenres)
        return value;

      return {
        ...value,
        filter: {
          ...value.filter,
          primaryGenres: album.primaryGenres,
          secondaryGenres: album.secondaryGenres,
        },
      };
    });
  };

  return (
    <main>
      <PageHeader />
      <Container size="xl" py="lg">
        {initialSettingsStatus === "pending" && <Spinner />}
        {initialSettingsStatus === "success" && initialSettings && (
          <Grid>
            <Grid.Col md={3}>
              <RecommendationSettingsPanel
                defaultSettings={initialSettings}
                genreOptions={genreOptions}
                onSubmit={setSettingsFormValue}
                profiles={profiles}
                albumRecommendationPresets={albumRecommendationPresets}
              />
            </Grid.Col>
            <Grid.Col md={9}>
              <Panel>
                <Stack spacing="md">
                  <Title order={4}>Recommendations</Title>
                  {recommendationStatus === "pending" && (
                    <div>
                      <Spinner />
                    </div>
                  )}
                  {recommendationStatus === "success" && recommendations && (
                    <Recommendations
                      recommendations={recommendations}
                      handleFindSimilarAlbums={findSimilarAlbums}
                    />
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

Home.getInitialProps = async () => ({
  genreOptions: await api.getGenres(),
  profiles: await api.getProfiles(),
  albumRecommendationPresets: await api.getAlbumRecommendationPresets(),
});

export default Home;
