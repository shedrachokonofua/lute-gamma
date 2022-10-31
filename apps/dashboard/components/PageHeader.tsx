import { Header, Container, Group, Title } from "@mantine/core";
import { IconPlayerTrackNext } from "@tabler/icons";

export const PageHeader = () => (
  <Header
    height={60}
    sx={(theme) => ({
      boxShadow: theme.shadows.xs,
    })}
  >
    <Container size="xl" sx={{ height: "100%" }}>
      <Group align="center" spacing="xs" sx={{ height: "100%" }}>
        <IconPlayerTrackNext />
        <Title order={1} size="h3" weight="normal">
          Lute
        </Title>
      </Group>
    </Container>
  </Header>
);
