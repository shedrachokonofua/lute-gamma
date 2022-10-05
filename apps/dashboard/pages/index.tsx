import type { NextPage } from "next";
import { Container, Grid, Header, Stack, Text } from "@mantine/core";
import { RecommendationSettings } from "@lute/domain";
import { useAsync } from "../hooks/use-async";
import { profileClient } from "../clients";

const useRecommendations = (profileId: string, settings: any) => {
  const result = useAsync(() =>
    profileClient.getRecommendations(profileId, settings)
  );
  console.log(result);
};

const Home: NextPage = () => {
  useRecommendations("default", {} as RecommendationSettings);
  return (
    <>
      <Header height={60} p="md">
        <Container size="md">Lute</Container>
      </Header>
      <Container
        size="md"
        sx={{
          paddingTop: 32,
        }}
      >
        <Stack>
          <Grid>
            <Grid.Col md={4}>
              <Text>Recommedation Settings</Text>
            </Grid.Col>
            <Grid.Col md={8}>Recommendations</Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </>
  );
};

export default Home;
