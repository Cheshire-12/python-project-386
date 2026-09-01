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
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconClock, IconPencil, IconTrash } from '@tabler/icons-react';
import { adminApi } from '@/api/admin';
import { AdminSidebar } from '@/components/AdminSidebar';
import type { EventType, EventTypeCreate } from '@/types';

export function AdminEventTypes() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<EventTypeCreate>({
    name: '',
    description: '',
    durationMinutes: 30,
  });

  const [editingType, setEditingType] = useState<EventType | null>(null);
  const [editForm, setEditForm] = useState<EventTypeCreate>({
    name: '',
    description: '',
    durationMinutes: 30,
  });
  const [saving, setSaving] = useState(false);

  const [deletingType, setDeletingType] = useState<EventType | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      setCreateModalOpen(false);
      setForm({ name: '', description: '', durationMinutes: 30 });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (et: EventType) => {
    setEditingType(et);
    setEditForm({
      name: et.name,
      description: et.description,
      durationMinutes: et.durationMinutes,
    });
  };

  const handleUpdate = async () => {
    if (!editingType) return;
    setSaving(true);
    try {
      await adminApi.eventTypes.update(editingType.id, editForm);
      setEditingType(null);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingType) return;
    setDeleting(true);
    try {
      const result = await adminApi.eventTypes.delete(deletingType.id);
      setDeletingType(null);
      load();
      if (result && result.deletedBookings > 0) {
        notifications.show({
          title: 'Удалено',
          message: `Тип события удалён. Удалено бронирований: ${result.deletedBookings}`,
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Удалено',
          message: 'Тип события удалён',
          color: 'green',
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SimpleGrid cols={{ base: 1, md: 4 }} spacing={0}>
      <AdminSidebar />
      <Paper
        p="md"
        style={{
          gridColumn: 'span 3',
          backgroundColor: '#18181b',
        }}
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2}>Типы событий</Title>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setCreateModalOpen(true)}
            >
              Создать
            </Button>
          </Group>

          {loading ? (
            <Center py="xl">
              <Loader color="gray" />
            </Center>
          ) : error ? (
            <Text c="red">{error}</Text>
          ) : eventTypes.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              Типов событий пока нет. Создайте первый!
            </Text>
          ) : (
            <Table
              styles={{
                table: { backgroundColor: '#25262b' },
                th: { color: '#909296', borderColor: '#2c2e33' },
                td: { borderColor: '#2c2e33' },
                tr: { color: '#fafafa' },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Название</Table.Th>
                  <Table.Th>Описание</Table.Th>
                  <Table.Th>Длительность</Table.Th>
                  <Table.Th>Действия</Table.Th>
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
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Редактировать">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => openEdit(et)}
                          >
                            <IconPencil size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Удалить">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => setDeletingType(et)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>

        {/* Create modal */}
        <Modal
          opened={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Новый тип события"
          centered
          styles={{
            content: { backgroundColor: '#1a1b1e' },
            header: { backgroundColor: '#1a1b1e' },
            title: { fontWeight: 700, fontSize: '1.25rem', color: '#fafafa' },
          }}
        >
          <Stack gap="md">
            <TextInput
              label="Название"
              placeholder="Консультация"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.currentTarget.value })
              }
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
            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setCreateModalOpen(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleCreate} loading={creating}>
                Создать
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Edit modal */}
        <Modal
          opened={editingType !== null}
          onClose={() => setEditingType(null)}
          title="Редактировать тип события"
          centered
          styles={{
            content: { backgroundColor: '#1a1b1e' },
            header: { backgroundColor: '#1a1b1e' },
            title: { fontWeight: 700, fontSize: '1.25rem', color: '#fafafa' },
          }}
        >
          <Stack gap="md">
            <TextInput
              label="Название"
              placeholder="Консультация"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.currentTarget.value })
              }
              required
            />
            <Textarea
              label="Описание"
              placeholder="Краткое описание события"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  description: e.currentTarget.value,
                })
              }
              required
            />
            <NumberInput
              label="Длительность (мин)"
              value={editForm.durationMinutes}
              onChange={(val) =>
                setEditForm({
                  ...editForm,
                  durationMinutes:
                    typeof val === 'number' ? val : parseInt(String(val)) || 30,
                })
              }
              min={1}
              step={5}
              required
            />
            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setEditingType(null)}
              >
                Отмена
              </Button>
              <Button onClick={handleUpdate} loading={saving}>
                Сохранить
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Delete confirmation modal */}
        <Modal
          opened={deletingType !== null}
          onClose={() => setDeletingType(null)}
          title="Удалить тип события?"
          centered
          styles={{
            content: { backgroundColor: '#1a1b1e' },
            header: { backgroundColor: '#1a1b1e' },
            title: { fontWeight: 700, fontSize: '1.25rem', color: '#fafafa' },
          }}
        >
          <Stack gap="md">
            <Text c="dimmed">
              Вы уверены, что хотите удалить «{deletingType?.name}»?
            </Text>
            <Text c="red" size="sm">
              Все бронирования, связанные с этим событием, также будут удалены.
              Это действие нельзя отменить.
            </Text>
            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setDeletingType(null)}
              >
                Отмена
              </Button>
              <Button color="red" onClick={handleDelete} loading={deleting}>
                Удалить
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Paper>
    </SimpleGrid>
  );
}
