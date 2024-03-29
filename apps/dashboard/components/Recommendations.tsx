import {
  AlbumAssessment,
  AlbumDocument,
  AlbumRecommendation,
} from "@lute/domain";
import {
  ActionIcon,
  Badge,
  Grid,
  Group,
  HoverCard,
  Menu,
  Text,
} from "@mantine/core";
import { IconDotsVertical, IconPlus, IconSearch, IconX } from "@tabler/icons";
import React from "react";

interface RecommendationsProps {
  recommendations: AlbumRecommendation[];
  handleFindSimilarAlbums: (album: AlbumDocument) => void;
  handleExcludeAlbum: (album: AlbumDocument) => void;
}

const printPercentile = (quantile: number): string =>
  `${(quantile * 100).toFixed(1)}%`;

const Rating = ({ assessment }: { assessment: AlbumAssessment }) => (
  <HoverCard width={220} position="right-start" closeDelay={0}>
    <HoverCard.Target>
      <Text
        size="xl"
        weight="bold"
        sx={{
          cursor: "pointer",
          width: "fit-content",
          margin: "auto",
        }}
      >
        {printPercentile(assessment.score)}
      </Text>
    </HoverCard.Target>
    <HoverCard.Dropdown>
      <Text size="xs" weight="bold">
        Percentiles
      </Text>
      <Text size="xs">
        Rating: {printPercentile(assessment.metadata.ratingQuantile as number)}
      </Text>
      <Text size="xs">
        Rating Count:{" "}
        {printPercentile(assessment.metadata.ratingCountQuantile as number)}
      </Text>
      <Text size="xs">
        Descriptors:{" "}
        {printPercentile(
          assessment.metadata.averageDescriptorQuantile as number
        )}
      </Text>
      <Text size="xs">
        Primary Genres:{" "}
        {printPercentile(
          assessment.metadata.averagePrimaryGenreQuantile as number
        )}
      </Text>
      <Text size="xs">
        Secondary Genres:{" "}
        {assessment.metadata?.averageSecondaryGenreQuantile
          ? printPercentile(
              assessment.metadata.averageSecondaryGenreQuantile as number
            )
          : "N/A"}
      </Text>
      <Text size="xs">
        Primary Cross Genres:{" "}
        {printPercentile(
          assessment.metadata.averagePrimaryCrossGenreQuantile as number
        )}
      </Text>
      <Text size="xs">
        Secondary Cross Genres:{" "}
        {assessment.metadata?.averageSecondaryCrossGenreQuantile
          ? printPercentile(
              assessment.metadata.averageSecondaryCrossGenreQuantile as number
            )
          : "N/A"}
      </Text>
    </HoverCard.Dropdown>
  </HoverCard>
);

export const Recommendations = ({
  recommendations,
  handleFindSimilarAlbums,
  handleExcludeAlbum,
}: RecommendationsProps) => (
  <Grid gutter="xl">
    {recommendations.map((recommendation) => (
      <React.Fragment key={recommendation.album.fileName}>
        <Grid.Col xs={0.5}>
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon color="blue" radius="xl" variant="transparent">
                <IconDotsVertical size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item icon={<IconPlus size={14} />}>
                Add to Profile
              </Menu.Item>
              <Menu.Item
                icon={<IconSearch size={14} />}
                onClick={() => handleFindSimilarAlbums(recommendation.album)}
              >
                Find Similar
              </Menu.Item>
              <Menu.Item
                color="red"
                icon={<IconX size={14} />}
                onClick={() => handleExcludeAlbum(recommendation.album)}
              >
                Exclude from Recommendations
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Grid.Col>
        <Grid.Col xs={9.5}>
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
                  "http://rateyourmusic.com/" + recommendation.album.fileName
                }
                target="_blank"
                rel="noreferrer"
              >
                {recommendation.album.name}
              </a>
            </Text>
            <Badge>{recommendation.album.rating} / 5</Badge>
          </Group>
          <div>
            <Text size="lg" weight="bold">
              {recommendation.album.artists?.map((a) => a.name).join(", ")}
            </Text>
          </div>
          <div>
            <Text>{recommendation.album.primaryGenres?.join(", ")}</Text>
          </div>
          <div>
            <Text size="md">
              {recommendation.album.secondaryGenres?.join(", ")}
            </Text>
          </div>
          <div>
            <Text size="sm" color="gray">
              {recommendation.album.descriptors?.join(", ")}
            </Text>
          </div>
        </Grid.Col>
        <Grid.Col xs={2}>
          <Rating assessment={recommendation.assessment} />
        </Grid.Col>
      </React.Fragment>
    ))}
  </Grid>
);
