import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Divider,
  Center,
  Loader,
  Paper,
  Button,
} from '@mantine/core';
import { IconCheck, IconArrowLeft } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { bookingsApi } from '@/api/bookings';
import type { Booking } from '@/types';

export function BookingConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    bookingsApi
      .get(Number(id))
      .then(setBooking)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader color="gray" />
      </Center>
    );
  }

  if (error || !booking) {
    return (
      <Center py="xl">
        <Text c="red">{error || 'Бронирование не найдено'}</Text>
      </Center>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="xl">
        <Paper
          p="xl"
          radius="md"
          w="100%"
          style={{ backgroundColor: '#25262b', border: '1px solid #2c2e33' }}
        >
          <Stack gap="lg" align="center">
            <Badge
              color="green"
              variant="light"
              size="xl"
              leftSection={<IconCheck size={20} />}
            >
              Запись подтверждена
            </Badge>

            <Title order={2} ta="center">
              Вы записаны!
            </Title>

            <Divider w="100%" color="#2c2e33" />

            <Stack gap="sm" w="100%">
              <Group justify="space-between">
                <Text c="dimmed">Имя:</Text>
                <Text fw={500}>{booking.guestName}</Text>
              </Group>
              {booking.email && (
                <Group justify="space-between">
                  <Text c="dimmed">Email:</Text>
                  <Text fw={500}>{booking.email}</Text>
                </Group>
              )}
              {booking.phone && (
                <Group justify="space-between">
                  <Text c="dimmed">Телефон:</Text>
                  <Text fw={500}>{booking.phone}</Text>
                </Group>
              )}
              <Group justify="space-between">
                <Text c="dimmed">Время:</Text>
                <Text fw={500}>
                  {dayjs(booking.startsAt).format('D MMMM YYYY, HH:mm')}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text c="dimmed">ID записи:</Text>
                <Text fw={500}>#{booking.id}</Text>
              </Group>
            </Stack>
          </Stack>
        </Paper>

        <Button
          component={Link}
          to="/event-types"
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={18} />}
        >
          Вернуться к событиям
        </Button>
      </Stack>
    </Container>
  );
}
