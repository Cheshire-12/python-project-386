import { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Button,
  TextInput,
  NumberInput,
  Text,
  Textarea,
} from '@mantine/core';
import { adminApi } from '@/api/admin';
import type { EventTypeCreate } from '@/types';

interface CreateEventTypeModalProps {
  opened: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateEventTypeModal({
  opened,
  onClose,
  onCreated,
}: CreateEventTypeModalProps) {
  const [form, setForm] = useState<EventTypeCreate>({
    name: '',
    description: '',
    durationMinutes: 30,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.description.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await adminApi.eventTypes.create(form);
      setForm({ name: '', description: '', durationMinutes: 30 });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', description: '', durationMinutes: 30 });
    setError(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Новый тип события"
      size="lg"
      centered
      styles={{
        content: { backgroundColor: '#1a1b1e' },
        header: { backgroundColor: '#1a1b1e' },
        title: { fontWeight: 700, fontSize: '1.25rem', color: '#fafafa' },
      }}
    >
      <Stack gap="md">
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}

        <TextInput
          label="Название"
          placeholder="Консультация"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          required
        />

        <Textarea
          label="Описание"
          placeholder="Краткое описание события"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.currentTarget.value })
          }
          required
          autosize
          minRows={2}
        />

        <NumberInput
          label="Длительность (мин)"
          value={form.durationMinutes}
          onChange={(val) =>
            setForm({
              ...form,
              durationMinutes:
                typeof val === 'number' ? val : parseInt(String(val)) || 30,
            })
          }
          min={1}
          step={5}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleCreate} loading={creating}>
            Создать
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
