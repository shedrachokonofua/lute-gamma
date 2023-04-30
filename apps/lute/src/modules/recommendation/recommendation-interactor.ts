import {
  AssessmentModel,
  AlbumRecommendationParameters,
  AlbumAssessment,
  AlbumRecommendation,
  AlbumAssessmentParameters,
  ArtistAssessmentParameters,
  ArtistAssessment,
  ArtistRecommendationParameters,
  ArtistRecommendation,
} from "@lute/domain";
import { executeWithTimer } from "../../lib";
import { logger } from "../../logger";
import { AlbumInteractor } from "../albums";
import { ArtistInteractor } from "../artists";
import { ProfileInteractor } from "../profile";
import { buildQuantileRankInteractor, jaccardInteractor } from "./models";

export const buildRecommendationInteractor = ({
  albumInteractor,
  artistInteractor,
  profileInteractor,
}: {
  albumInteractor: AlbumInteractor;
  artistInteractor: ArtistInteractor;
  profileInteractor: ProfileInteractor;
}) => {
  const quantileRankInteractor = buildQuantileRankInteractor(albumInteractor);

  const getProfile = async (profileId: string) => {
    const profile = await profileInteractor.getProfile(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }
    return profile;
  };

  return {
    async assessAlbum({
      albumId,
      profileId,
      model,
      settings,
    }: AlbumAssessmentParameters): Promise<AlbumAssessment> {
      const profile = await getProfile(profileId);

      const album = await albumInteractor.getAlbum(albumId);
      if (!album) {
        logger.error({ albumId }, "Unknown album");
        throw new Error("Unknown album");
      }

      switch (model) {
        case AssessmentModel.JaccardIndex:
          return jaccardInteractor.assessAlbum({
            album,
            profile,
            settings,
          });
        case AssessmentModel.QuantileRank:
          return quantileRankInteractor.assessAlbum({
            album,
            profile,
            settings,
          });
      }
    },
    async assessArtist({
      artistId,
      profileId,
      model,
      settings,
    }: ArtistAssessmentParameters): Promise<ArtistAssessment> {
      const profile = await getProfile(profileId);

      const artist = await artistInteractor.getArtist(artistId);
      if (!artist) {
        logger.error({ artistId }, "Unknown artist");
        throw new Error("Unknown artist");
      }

      switch (model) {
        case AssessmentModel.JaccardIndex:
          return jaccardInteractor.assessArtist({
            artist,
            profile,
            settings,
          });
        case AssessmentModel.QuantileRank:
          return quantileRankInteractor.assessArtist({
            artist,
            profile,
            settings,
          });
      }
    },
    async recommendAlbums({
      profileId,
      model,
      settings,
      filter,
      count = 50,
    }: AlbumRecommendationParameters): Promise<AlbumRecommendation[]> {
      const profile = await getProfile(profileId);

      const [albums, albumsElapsedTime] = await executeWithTimer(() =>
        albumInteractor.findAlbums({
          primaryGenres: [...filter.primaryGenres],
          excludeArtists: [...filter.excludeArtists],
          excludePrimaryGenres: [...filter.excludePrimaryGenres],
          excludeSecondaryGenres: [...filter.excludeSecondaryGenres],
          excludeKeys: [
            ...profile.albums.map((a) => a.item),
            ...filter.excludeAlbums,
          ],
        })
      );
      logger.info(
        { albums: albums.length, elapsedTime: albumsElapsedTime },
        "Got albums"
      );

      switch (model) {
        case AssessmentModel.JaccardIndex:
          return jaccardInteractor.recommendAlbums({
            profile,
            albums,
            settings,
            count,
          });
        case AssessmentModel.QuantileRank:
          return quantileRankInteractor.recommendAlbums({
            profile,
            albums,
            settings,
            count,
          });
      }
    },
    async recommendArtists({
      profileId,
      model,
      settings,
      filter,
      count = 50,
    }: ArtistRecommendationParameters): Promise<ArtistRecommendation[]> {
      const profile = await getProfile(profileId);

      const [artists, artistsElapsedTime] = await executeWithTimer(() =>
        artistInteractor.findArtists({
          primaryGenres: [...filter.primaryGenres],
          excludePrimaryGenres: [...filter.excludePrimaryGenres],
          excludeKeys: [
            ...profile.details.artists.map((a) => a.item),
            ...filter.excludeArtists,
          ],
        })
      );
      logger.info(
        { artists: artists.length, elapsedTime: artistsElapsedTime },
        "Got artists"
      );

      switch (model) {
        case AssessmentModel.JaccardIndex:
          return jaccardInteractor.recommendArtists({
            profile,
            artists,
            settings,
            count,
          });
        case AssessmentModel.QuantileRank:
          return quantileRankInteractor.recommendArtists({
            profile,
            artists,
            settings,
            count,
          });
      }
    },
  };
};
