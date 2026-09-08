import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Text,
  Stack,
  Group,
  Center,
  Loader,
  Paper,
  Divider,
} from '@mantine/core';
import { IconClock, IconGlobe } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { eventTypesApi } from '@/api/eventTypes';
import { bookingsApi } from '@/api/bookings';
import { SlotPicker } from '@/components/SlotPicker';
import { BookingForm } from '@/components/BookingForm';
import { nowMsk } from '@/lib/datetime';
import { formatDuration } from '@/lib/format';
import type { EventType, Slot } from '@/types';

export function GuestBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => nowMsk());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);

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
      .then((data) => {
        setSlots(data);
        setSlotsError(null);
      })
      .catch((err) => setSlotsError(err.message));
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
          <div>
            <Text fw={500} size="lg">
              {eventType.name}
            </Text>
            <Text size="sm" c="dimmed" mt={2}>
              {eventType.description}
            </Text>
          </div>

          <Group gap="xs">
            <IconClock size={16} color="#909296" />
            <Text size="sm" c="dimmed">
              {formatDuration(eventType.durationMinutes)}
            </Text>
          </Group>

          <Group gap="xs">
            <IconGlobe size={16} color="#909296" />
            <Text size="sm" c="dimmed">
              Europe/Moscow
            </Text>
          </Group>
        </Stack>
      </Paper>

      {/* Center + Right panels — Calendar + Slots */}
      <div style={{ flex: 1, padding: 16, backgroundColor: '#18181b' }}>
        <Stack gap="md">
          {slotsError && <Text c="red">{slotsError}</Text>}

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
