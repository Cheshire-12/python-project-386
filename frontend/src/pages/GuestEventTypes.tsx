import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  TextInput,
  Button,
  Card,
  Badge,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconSearch,
  IconPlus,
  IconClock,
  IconExternalLink,
  IconLink,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { eventTypesApi } from '@/api/eventTypes';
import { CreateEventTypeModal } from '@/components/CreateEventTypeModal';
import type { EventType } from '@/types';

export function GuestEventTypes() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    eventTypesApi
      .list()
      .then(setEventTypes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = eventTypes.filter(
    (et) =>
      et.name.toLowerCase().includes(search.toLowerCase()) ||
      et.description.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <Center py="xl">
        <Loader color="gray" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center py="xl">
        <Text c="red">{error}</Text>
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} fw={700}>
              Ссылки
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              Создайте мероприятие, чтобы поделиться с людьми для бронирования
              в вашем календаре.
            </Text>
          </div>

          <Group gap="sm">
            <TextInput
              placeholder="Искать"
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={220}
              variant="default"
            />
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setModalOpen(true)}
            >
              Создать
            </Button>
          </Group>
        </Group>

        {filtered.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            {search
              ? 'Ничего не найдено'
              : 'Типов событий пока нет. Создайте первый!'}
          </Text>
        ) : (
          <Stack gap="sm">
            {filtered.map((et) => (
              <Card
                key={et.id}
                p="lg"
                radius="md"
                style={{
                  backgroundColor: '#25262b',
                  border: '1px solid #2c2e33',
                }}
              >
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Group gap="sm" align="center">
                      <Text fw={600} size="lg">
                        {et.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        /event-types/{et.id}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {et.description}
                    </Text>
                    <Badge
                      variant="light"
                      color="gray"
                      size="sm"
                      leftSection={<IconClock size={12} />}
                      mt={4}
                      w="fit-content"
                    >
                      {et.durationMinutes}m
                    </Badge>
                  </Stack>

                  <Group gap="xs" align="center">
                    <Button
                      component={Link}
                      to={`/event-types/${et.id}`}
                      variant="light"
                      color="blue"
                      size="compact-sm"
                      rightSection={<IconExternalLink size={14} />}
                    >
                      Забронировать
                    </Button>
                    <Tooltip label="Копировать ссылку">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/event-types/${et.id}`,
                          );
                          notifications.show({
                            message: 'Ссылка скопирована',
                            color: 'green',
                          });
                        }}
                      >
                        <IconLink size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <CreateEventTypeModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={load}
      />
    </Container>
  );
}
