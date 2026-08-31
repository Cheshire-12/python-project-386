import { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Stack,
  Group,
  Table,
  Badge,
  Center,
  Loader,
  Paper,
  SimpleGrid,
} from '@mantine/core';
import { IconClock, IconUser } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { adminApi } from '@/api/admin';
import { AdminSidebar } from '@/components/AdminSidebar';
import type { Booking } from '@/types';

export function AdminUpcoming() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.bookings
      .upcoming()
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Гость</Table.Th>
                  <Table.Th>Время</Table.Th>
                  <Table.Th>Тип события</Table.Th>
                  <Table.Th>Контакты</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bookings.map((b) => (
                  <Table.Tr key={b.id}>
                    <Table.Td>#{b.id}</Table.Td>
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
                      <Badge variant="light" color="blue">
                        #{b.eventTypeId}
                      </Badge>
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
