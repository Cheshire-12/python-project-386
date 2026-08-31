import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  Stack,
  Group,
  Center,
  Loader,
  Paper,
  Avatar,
  Select,
  Divider,
} from '@mantine/core';
import { IconClock, IconVideo, IconGlobe } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { eventTypesApi } from '@/api/eventTypes';
import { bookingsApi } from '@/api/bookings';
import { SlotPicker } from '@/components/SlotPicker';
import { BookingForm } from '@/components/BookingForm';
import type { EventType, Slot } from '@/types';

const timezones = [
  { value: 'Europe/Moscow', label: 'Europe/Moscow' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
  { value: 'UTC', label: 'UTC' },
];

export function GuestBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [timezone, setTimezone] = useState('Europe/Moscow');
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
        <Loader color="gray" />
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
    <div
      style={{
        display: 'flex',
        gap: 0,
        maxWidth: 1200,
        margin: '0 auto',
        border: '1px solid #2c2e33',
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden',
      }}
    >
      {/* Left panel — Event info */}
      <Paper
        p="xl"
        style={{
          width: 280,
          flexShrink: 0,
          backgroundColor: '#1a1b1e',
          borderRight: '1px solid #2c2e33',
        }}
      >
        <Stack gap="md">
          <Group gap="sm">
            <Avatar size={40} radius="xl" color="blue" variant="filled">
              AV
            </Avatar>
            <Text fw={500} size="sm">
              Andrey Vedenkin
            </Text>
          </Group>

          <Title order={3} fw={700}>
            {eventType.name}
          </Title>

          <Group gap="xs">
            <IconClock size={16} color="#909296" />
            <Text size="sm" c="dimmed">
              {eventType.durationMinutes}m
            </Text>
          </Group>

          <Group gap="xs">
            <IconVideo size={16} color="#909296" />
            <Text size="sm" c="dimmed">
              Cal Video
            </Text>
          </Group>

          <Group gap="xs">
            <IconGlobe size={16} color="#909296" />
            <Select
              data={timezones}
              value={timezone}
              onChange={(v) => v && setTimezone(v)}
              size="xs"
              variant="unstyled"
              style={{ flex: 1 }}
              styles={{
                input: {
                  color: '#fafafa',
                  padding: 0,
                  height: 'auto',
                  minHeight: 'auto',
                  border: 'none',
                  backgroundColor: 'transparent',
                },
              }}
            />
          </Group>
        </Stack>
      </Paper>

      {/* Center + Right panels — Calendar + Slots */}
      <div style={{ flex: 1, padding: 16, backgroundColor: '#18181b' }}>
        <Stack gap="md">
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

          {selectedSlot && (
            <>
              <Divider />
              <BookingForm
                eventType={eventType}
                selectedSlot={selectedSlot}
                onSubmit={handleSubmit}
                loading={submitting}
              />
            </>
          )}
        </Stack>
      </div>
    </div>
  );
}
