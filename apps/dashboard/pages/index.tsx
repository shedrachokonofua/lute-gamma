import type { NextPage } from "next";
import { Card, Elevation, Navbar, NavbarGroup } from "@blueprintjs/core";
import { useAsync } from "../hooks/use-async";
import { profileClient } from "../clients";
import {
  Container,
  Heading,
  HStack,
  RecommendationSettingsForm,
  RecommendationSettingsPanel,
  Spinner,
  VStack,
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
      <Navbar>
        <NavbarGroup>
          <Navbar.Heading>Lute</Navbar.Heading>
        </NavbarGroup>
      </Navbar>
      <Container>
        <HStack gap="xl">
          <div>
            <RecommendationSettingsPanel
              defaultSettings={getInitialRecommendationSettings()}
              onSubmit={setSettingsFormValue}
            />
          </div>
          <div
            style={{
              flex: 1,
            }}
          >
            <Card elevation={Elevation.ONE}>
              <VStack gap="md">
                <Heading level={5}>Recommendations</Heading>
                {status === "pending" && (
                  <div>
                    <Spinner />
                  </div>
                )}
                {status === "success" && (
                  <VStack gap="lg">
                    {recommendations &&
                      recommendations.map((recommendation) => (
                        <div key={recommendation.albumFileName}>
                          {recommendation.albumFileName}
                        </div>
                      ))}
                  </VStack>
                )}
              </VStack>
            </Card>
          </div>
        </HStack>
      </Container>
    </main>
  );
};

export default Home;
