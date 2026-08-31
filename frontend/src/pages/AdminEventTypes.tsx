import { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Table,
  Badge,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Center,
  Loader,
  Paper,
  SimpleGrid,
} from '@mantine/core';
import { IconPlus, IconClock } from '@tabler/icons-react';
import { adminApi } from '@/api/admin';
import { AdminSidebar } from '@/components/AdminSidebar';
import type { EventType, EventTypeCreate } from '@/types';

export function AdminEventTypes() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<EventTypeCreate>({
    name: '',
    description: '',
    durationMinutes: 30,
  });

  const load = () => {
    setLoading(true);
    adminApi.eventTypes
      .list()
      .then(setEventTypes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await adminApi.eventTypes.create(form);
      setModalOpen(false);
      setForm({ name: '', description: '', durationMinutes: 30 });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SimpleGrid cols={{ base: 1, md: 4 }} spacing={0}>
      <AdminSidebar />
      <Paper p="md" style={{ gridColumn: 'span 3' }}>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2}>Типы событий</Title>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setModalOpen(true)}
            >
              Создать
            </Button>
          </Group>

          {loading ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : error ? (
            <Text c="red">{error}</Text>
          ) : eventTypes.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              Типов событий пока нет. Создайте первый!
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Название</Table.Th>
                  <Table.Th>Описание</Table.Th>
                  <Table.Th>Длительность</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {eventTypes.map((et) => (
                  <Table.Tr key={et.id}>
                    <Table.Td>{et.id}</Table.Td>
                    <Table.Td fw={500}>{et.name}</Table.Td>
                    <Table.Td c="dimmed">{et.description}</Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color="blue"
                        leftSection={<IconClock size={14} />}
                      >
                        {et.durationMinutes} мин
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>

        <Modal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Новый тип события"
          centered
        >
          <Stack gap="md">
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
            />
            <NumberInput
              label="Длительность (мин)"
              value={form.durationMinutes}
              onChange={(val) =>
                setForm({ ...form, durationMinutes: (typeof val === 'number' ? val : parseInt(val) || 30) })
              }
              min={1}
              step={30}
              required
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreate} loading={creating}>
                Создать
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Paper>
    </SimpleGrid>
  );
}
