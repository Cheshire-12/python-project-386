import { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Stack,
  Group,
  Table,
  Center,
  Loader,
  Paper,
  SimpleGrid,
} from '@mantine/core';
import { IconClock, IconUser } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { adminApi } from '@/api/admin';
import { eventTypesApi } from '@/api/eventTypes';
import { AdminSidebar } from '@/components/AdminSidebar';
import type { Booking, EventType } from '@/types';

export function AdminUpcoming() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      adminApi.bookings.upcoming(),
      eventTypesApi.list(),
    ])
      .then(([bookingsData, types]) => {
        setBookings(bookingsData.bookings);
        setEventTypes(types);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const eventTypeMap = new Map(eventTypes.map((et) => [et.id, et.name]));

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
          <Title order={2}>Предстоящие встречи</Title>

          {loading ? (
            <Center py="xl">
              <Loader color="gray" />
            </Center>
          ) : error ? (
            <Text c="red">{error}</Text>
          ) : bookings.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              Предстоящих встреч нет
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
                  <Table.Th>Гость</Table.Th>
                  <Table.Th>Время</Table.Th>
                  <Table.Th>Название</Table.Th>
                  <Table.Th>Контакты</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bookings.map((b) => (
                  <Table.Tr key={b.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <IconUser size={16} color="#909296" />
                        <Text fw={500}>{b.guestName}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconClock size={14} color="#909296" />
                        {dayjs(b.startsAt).format('D MMM, HH:mm')}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>
                        {eventTypeMap.get(b.eventTypeId) ?? `#${b.eventTypeId}`}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={0}>
                        {b.email && (
                          <Text size="sm">{b.email}</Text>
                        )}
                        {b.phone && (
                          <Text size="sm" c="dimmed">
                            {b.phone}
                          </Text>
                        )}
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </SimpleGrid>
  );
}
