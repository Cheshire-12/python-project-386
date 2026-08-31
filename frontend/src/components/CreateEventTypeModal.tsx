import { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Button,
  TextInput,
  NumberInput,
  Text,
  Card,
  SimpleGrid,
  Radio,
} from '@mantine/core';
import {
  IconArrowsExchange,
  IconUsers,
  IconStack2,
  IconUser,
} from '@tabler/icons-react';
import { adminApi } from '@/api/admin';
import type { EventTypeCreate } from '@/types';

interface CreateEventTypeModalProps {
  opened: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const eventTypeInfo = [
  {
    value: 'roundrobin',
    label: 'По кругу',
    description: 'Цикл встреч между несколькими членами команды.',
    icon: IconArrowsExchange,
  },
  {
    value: 'collective',
    label: 'Коллективная встреча',
    description: 'Расписание встреч, когда доступны все выбранные члены команды.',
    icon: IconUsers,
  },
  {
    value: 'managed',
    label: 'Управляемое событие',
    description:
      'Создавайте и массово распространяйте ссылки на бронирование среди участников команды',
    icon: IconStack2,
  },
  {
    value: 'personal',
    label: 'Для себя',
    description: 'Создайте событие в своем личном профиле.',
    icon: IconUser,
  },
];

export function CreateEventTypeModal({
  opened,
  onClose,
  onCreated,
}: CreateEventTypeModalProps) {
  const [form, setForm] = useState<EventTypeCreate>({
    name: '',
    description: '',
    durationMinutes: 15,
  });
  const [selectedType, setSelectedType] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await adminApi.eventTypes.create(form);
      setForm({ name: '', description: '', durationMinutes: 15 });
      setSelectedType('');
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', description: '', durationMinutes: 15 });
    setSelectedType('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Stack gap={4}>
          <Text fw={700} size="xl">
            Добавить новую ссылку
          </Text>
          <Text size="sm" c="dimmed">
            Настройте ссылки для бронирования, чтобы предлагать различные типы
            встреч.
          </Text>
        </Stack>
      }
      size="lg"
      centered
      styles={{
        title: { width: '100%' },
        content: { backgroundColor: '#1a1b1e' },
        header: { backgroundColor: '#1a1b1e' },
      }}
    >
      <Stack gap="md">
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}

        <TextInput
          label="Заголовок"
          placeholder="Короткая встреча"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          required
        />

        <TextInput
          label="URL"
          placeholder="cal.com/andrey-vedenkin/"
          value={`event-types/${form.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')}`}
          readOnly
          variant="filled"
        />

        <NumberInput
          label="Продолжительность"
          value={form.durationMinutes}
          onChange={(val) =>
            setForm({
              ...form,
              durationMinutes:
                typeof val === 'number' ? val : parseInt(val) || 15,
            })
          }
          min={1}
          step={5}
          suffix=" мин."
          required
        />

        <SimpleGrid cols={2} spacing="sm" mt="sm">
          {eventTypeInfo.map((item) => (
            <Card
              key={item.value}
              p="md"
              radius="md"
              style={{
                backgroundColor: '#25262b',
                border:
                  selectedType === item.value
                    ? '2px solid #339af0'
                    : '1px solid #2c2e33',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedType(item.value)}
            >
              <Group gap="sm" align="flex-start">
                <item.icon size={24} color="#909296" />
                <div style={{ flex: 1 }}>
                  <Radio
                    checked={selectedType === item.value}
                    onChange={() => setSelectedType(item.value)}
                    label={item.label}
                    styles={{
                      label: { fontWeight: 600, color: '#fafafa' },
                      radio: { color: '#909296' },
                    }}
                  />
                  <Text size="xs" c="dimmed" mt={4}>
                    {item.description}
                  </Text>
                </div>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={handleClose}>
            Закрыть
          </Button>
          <Button onClick={handleCreate} loading={creating}>
            Продолжить
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
