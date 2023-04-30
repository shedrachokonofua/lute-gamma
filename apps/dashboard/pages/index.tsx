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
  AlbumRecommendationFilter,
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
    submitForm: submitSettingsForm,
    isInitialSettingsLoading,
  } = useRecommendationSettingsForm(fetchRecommendations);

  const updateFilter = (
    filterFactory: (
      value: AlbumRecommendationFilter
    ) => Partial<AlbumRecommendationFilter>
  ) => {
    const filter = filterFactory(settingsForm.values.filter);
    const nextValues = {
      ...settingsForm.values,
      filter: {
        ...settingsForm.values.filter,
        ...filter,
      },
    };
    settingsForm.setValues(nextValues);
    submitSettingsForm(nextValues);
  };

  const findSimilarAlbums = (album: AlbumDocument) => {
    if (!album.primaryGenres || !album.secondaryGenres) return;
    updateFilter(() => ({
      primaryGenres: album.primaryGenres,
      secondaryGenres: album.secondaryGenres,
    }));
  };

  const excludeAlbumFromRecommendations = (album: AlbumDocument) => {
    updateFilter((filter) => ({
      excludeAlbums: [...filter.excludeAlbums, album.fileName],
    }));
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
                      handleExcludeAlbum={excludeAlbumFromRecommendations}
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
