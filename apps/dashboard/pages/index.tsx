import type { NextPage } from "next";
import { Container, Stack, Grid, Title } from "@mantine/core";
import {
  PageHeader,
  Panel,
  Recommendations,
  RecommendationSettingsPanel,
  Spinner,
} from "../components";
import { useRecommendationSettingsForm, useRecommendations } from "../hooks";
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
  const {
    status: recommendationStatus,
    value: recommendations,
    execute: fetchRecommendations,
  } = useRecommendations();
  const {
    form: settingsForm,
    handleSubmit: submitSettingsForm,
    isInitialSettingsLoading,
  } = useRecommendationSettingsForm(fetchRecommendations);

  const findSimilarAlbums = (album: AlbumDocument) => {
    settingsForm.setValues((value) => {
      if (!value || !album.primaryGenres || !album.secondaryGenres)
        return value;

      return {
        ...value,
        filter: {
          ...value.filter,
          primaryGenres: album.primaryGenres,
          secondaryGenres: album.secondaryGenres,
        } as any,
      };
    });
    submitSettingsForm();
  };

  return (
    <main>
      <PageHeader />
      <Container size="xl" py="lg">
        {isInitialSettingsLoading && <Spinner />}
        {!isInitialSettingsLoading && (
          <Grid>
            <Grid.Col md={3}>
              <RecommendationSettingsPanel
                form={settingsForm}
                onSubmit={submitSettingsForm}
                genreOptions={genreOptions}
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
