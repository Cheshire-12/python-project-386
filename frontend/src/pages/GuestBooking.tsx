import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  SimpleGrid,
  Paper,
} from '@mantine/core';
import { IconClock, IconUser } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { eventTypesApi } from '@/api/eventTypes';
import { bookingsApi } from '@/api/bookings';
import { SlotPicker } from '@/components/SlotPicker';
import { BookingForm } from '@/components/BookingForm';
import type { EventType, Slot } from '@/types';

export function GuestBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    eventTypesApi
      .get(Number(id))
      .then(setEventType)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const from = dayjs().toISOString();
    const to = dayjs().add(14, 'day').toISOString();
    eventTypesApi
      .listSlots(Number(id), from, to)
      .then(setSlots)
      .catch(() => {});
  }, [id]);

  const handleSubmit = async (data: {
    guestName: string;
    email: string;
    phone: string;
  }) => {
    if (!selectedSlot || !eventType) return;
    setSubmitting(true);
    try {
      const booking = await bookingsApi.create({
        eventTypeId: eventType.id,
        startsAt: selectedSlot.start,
        guestName: data.guestName,
        email: data.email || undefined,
        phone: data.phone || undefined,
      });
      navigate(`/bookings/${booking.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error || !eventType) {
    return (
      <Center py="xl">
        <Text c="red">{error || 'Событие не найдено'}</Text>
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
          <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
              <Title order={3}>{eventType.name}</Title>
              <Text size="sm" c="dimmed">
                {eventType.description}
              </Text>
              <Divider />
              <Group>
                <Badge variant="light" color="blue" leftSection={<IconClock size={14} />}>
                  {eventType.durationMinutes} мин
                </Badge>
              </Group>
              <Group>
                <Badge variant="light" color="gray" leftSection={<IconUser size={14} />}>
                  Владелец календаря
                </Badge>
              </Group>
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md" style={{ gridColumn: 'span 2' }}>
            <SlotPicker
              slots={slots}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              onSlotSelect={setSelectedSlot}
            />
          </Paper>
        </SimpleGrid>

        {selectedSlot && (
          <BookingForm
            eventType={eventType}
            selectedSlot={selectedSlot}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        )}
      </Stack>
    </Container>
  );
}
