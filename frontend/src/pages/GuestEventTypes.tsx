import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Stack,
  Badge,
  Loader,
  Center,
  Group,
} from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { eventTypesApi } from '@/api/eventTypes';
import type { EventType } from '@/types';

export function GuestEventTypes() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    eventTypesApi
      .list()
      .then(setEventTypes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
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
        <div>
          <Title order={2}>Выберите тип события</Title>
          <Text c="dimmed">
            Доступно событий: {eventTypes.length}
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {eventTypes.map((et) => (
            <Card
              key={et.id}
              component={Link}
              to={`/event-types/${et.id}`}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600} size="lg">
                    {et.name}
                  </Text>
                  <Badge
                    variant="light"
                    color="blue"
                    leftSection={<IconClock size={14} />}
                  >
                    {et.durationMinutes} мин
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {et.description}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
