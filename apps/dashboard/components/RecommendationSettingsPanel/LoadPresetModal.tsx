import { AlbumRecommendationPreset } from "@lute/domain";
import { Box, Button, Modal, Select, Stack } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { useState, useMemo } from "react";

interface LoadPresetModalProps {
  albumRecommendationPresets: AlbumRecommendationPreset[];
  onSubmit: (preset: AlbumRecommendationPreset) => void;
  onClose: () => void;
  isOpen: boolean;
}

const getPresetsById = (presets: AlbumRecommendationPreset[]) =>
  presets.reduce((acc, preset) => {
    acc[preset.id] = preset;
    return acc;
  }, {} as Record<string, AlbumRecommendationPreset>);

export const LoadPresetModal: React.FC<LoadPresetModalProps> = ({
  albumRecommendationPresets,
  onSubmit,
  onClose,
  isOpen,
}) => {
  const presetsById = useMemo(
    () => getPresetsById(albumRecommendationPresets),
    [albumRecommendationPresets]
  );
  const [selectedPreset, setSelectedPreset] = useState<
    AlbumRecommendationPreset | undefined
  >(undefined);

  const handleSubmit = () => {
    if (selectedPreset) {
      onSubmit(selectedPreset);
      onClose();
    }
  };

  return (
    <Modal
      centered
      opened={isOpen}
      onClose={onClose}
      title="Load Preset"
      zIndex={10}
    >
      <Box
        sx={{
          minHeight: 150,
        }}
      >
        <Stack spacing="lg">
          <Select
            label="Preset"
            placeholder="Select preset"
            dropdownPosition="bottom"
            data={albumRecommendationPresets.map((preset) => ({
              label: preset.name,
              value: preset.id,
            }))}
            value={selectedPreset?.id}
            onChange={(value) => {
              if (value) {
                setSelectedPreset(presetsById[value]);
              }
            }}
          />
          {selectedPreset && (
            <Prism
              language="json"
              colorScheme="dark"
              sx={{
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {JSON.stringify(selectedPreset, null, 2)}
            </Prism>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={handleSubmit} disabled={!selectedPreset}>
              Load
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};
