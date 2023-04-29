import { AlbumRecommendationPreset, AssessmentModel } from "@lute/domain";
import {
  Autocomplete,
  Box,
  Button,
  Modal,
  Stack,
  TextInput,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { useEffect, useState } from "react";
import { useAsync } from "../../hooks/use-async";
import { api } from "../../api";

interface SavePresetModalProps {
  isOpen: boolean;
  onSubmit: () => void;
  onClose: () => void;
  mostRecentPreset?: AlbumRecommendationPreset;
  albumRecommendationPresets: AlbumRecommendationPreset[];
  filter: AlbumRecommendationPreset["filter"];
  settings: AlbumRecommendationPreset["settings"];
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onSubmit,
  onClose,
  mostRecentPreset,
  albumRecommendationPresets,
  filter,
  settings,
}) => {
  const [id, setId] = useState<string>(mostRecentPreset?.id ?? "");
  const [name, setName] = useState<string>(mostRecentPreset?.name ?? "");

  const existingPresetWithId = albumRecommendationPresets.find(
    (preset) => preset.id === id
  );
  useEffect(() => {
    setName(existingPresetWithId?.name ?? "");
  }, [existingPresetWithId, id]);

  const newPreset = {
    type: "album",
    model: AssessmentModel.QuantileRank,
    id,
    name,
    filter,
    settings,
  } as AlbumRecommendationPreset;

  const isValid = !!id.trim() && !!name.trim();

  const { execute, status } = useAsync(
    async () => {
      const action = existingPresetWithId
        ? api.updateAlbumRecommendationPreset(newPreset.id, newPreset)
        : api.createAlbumRecommendationPreset(newPreset);
      await action;
      onSubmit();
      onClose();
    },
    [newPreset, existingPresetWithId],
    false
  );

  return (
    <Modal centered opened={isOpen} onClose={onClose} title="Save Preset">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          execute();
        }}
      >
        <Stack spacing="lg">
          <Autocomplete
            label="Preset ID"
            placeholder="Enter preset id"
            value={id}
            onChange={setId}
            data={albumRecommendationPresets.map((preset) => preset.id)}
          />
          <TextInput
            label="Preset Name"
            placeholder="Enter preset name"
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setName(event.currentTarget.value)
            }
          />
          <Prism
            language="json"
            colorScheme="dark"
            sx={{
              maxHeight: 400,
              overflowY: "auto",
            }}
          >
            {JSON.stringify(newPreset, null, 2)}
          </Prism>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="submit"
              disabled={!isValid}
              loading={status === "pending"}
            >
              {existingPresetWithId ? "Save" : "Create"}
            </Button>
          </Box>
        </Stack>
      </form>
    </Modal>
  );
};
