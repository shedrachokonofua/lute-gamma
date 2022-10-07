import type { NextPage } from "next";
import { useAsync } from "../hooks/use-async";
import { profileClient } from "../clients";
import {
  Header,
  Container,
  Paper,
  Group,
  Stack,
  Grid,
  Title,
} from "@mantine/core";
import {
  Panel,
  RecommendationSettingsForm,
  RecommendationSettingsPanel,
  Spinner,
} from "../components";
import { useCallback, useEffect, useState } from "react";

const useRecommendations = () => {
  const request = useCallback((settingsForm: RecommendationSettingsForm) => {
    const { profileId, ...settings } = settingsForm;
    return profileClient.getRecommendations(profileId, settings);
  }, []);

  return useAsync(request, false);
};

// const Home: NextPage = () => {
//   useRecommendations("default", {} as RecommendationSettings);
//   return (
//     <>
//       <Header height={60} p="md">
//         <Container size="md">Lute</Container>
//       </Header>
//       <Container
//         size="md"
//         sx={{
//           paddingTop: 32,
//         }}
//       >
//         <Stack>
//           <Grid>
//             <Grid.Col md={4}>
//               <Text>Recommedation Settings</Text>
//             </Grid.Col>
//             <Grid.Col md={8}>Recommendations</Grid.Col>
//           </Grid>
//         </Stack>
//       </Container>
//     </>
//   );
// };

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

const getInitialRecommendationSettings = () => {
  const settings =
    typeof window !== "undefined"
      ? localStorage.getItem("settings")
      : undefined;
  return settings ? JSON.parse(settings) : defaultRecommendationSettings;
};

const Home: NextPage = () => {
  const [settingsFormValue, setSettingsFormValue] =
    useState<RecommendationSettingsForm>(getInitialRecommendationSettings);

  const { status, value: recommendations, execute } = useRecommendations();

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settingsFormValue));
    execute(settingsFormValue);
  }, [execute, settingsFormValue]);

  return (
    <main>
      <Header
        height={50}
        sx={(theme) => ({
          boxShadow: theme.shadows.xs,
        })}
      >
        <Container size="lg">Lute</Container>
      </Header>
      <Container size="lg" py="lg">
        <Grid>
          <Grid.Col md={4}>
            <RecommendationSettingsPanel
              defaultSettings={getInitialRecommendationSettings()}
              onSubmit={setSettingsFormValue}
            />
          </Grid.Col>
          <Grid.Col md={8}>
            <Panel>
              <Stack spacing="md">
                <Title order={4}>Recommendations</Title>
                {status === "pending" && (
                  <div>
                    <Spinner />
                  </div>
                )}
                {status === "success" && (
                  <Stack spacing="lg">
                    {recommendations &&
                      recommendations.map((recommendation) => (
                        <div key={recommendation.albumFileName}>
                          {recommendation.albumFileName}
                        </div>
                      ))}
                  </Stack>
                )}
              </Stack>
            </Panel>
          </Grid.Col>
        </Grid>
      </Container>
    </main>
  );
};

export default Home;
