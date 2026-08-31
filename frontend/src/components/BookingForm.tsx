import { useState } from 'react';
import {
  Paper,
  Text,
  Group,
  Stack,
  Button,
  TextInput,
  Badge,
  Divider,
  LoadingOverlay,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { Slot, EventType } from '@/types';

interface BookingFormProps {
  eventType: EventType;
  selectedSlot: Slot;
  onSubmit: (data: { guestName: string; email: string; phone: string }) => void;
  loading: boolean;
}

export function BookingForm({
  eventType,
  selectedSlot,
  onSubmit,
  loading,
}: BookingFormProps) {
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ guestName, email, phone });
  };

  return (
    <Paper
      p="md"
      radius="md"
      pos="relative"
      style={{ backgroundColor: '#25262b' }}
    >
      <LoadingOverlay visible={loading} />
      <Stack gap="md">
        <Text fw={600} size="lg">
          Запись на «{eventType.name}»
        </Text>

        <Group>
          <Badge
            variant="light"
            color="green"
            leftSection={<IconCheck size={14} />}
          >
            Свободно
          </Badge>
          <Text size="sm" c="dimmed">
            {dayjs(selectedSlot.start).format('D MMMM YYYY, HH:mm')} –{' '}
            {dayjs(selectedSlot.end).format('HH:mm')}
          </Text>
        </Group>

        <Divider color="#2c2e33" />

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Ваше имя"
              placeholder="Иван Иванов"
              value={guestName}
              onChange={(e) => setGuestName(e.currentTarget.value)}
              required
            />
            <TextInput
              label="Email"
              placeholder="ivan@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <TextInput
              label="Телефон"
              placeholder="+7 (999) 123-45-67"
              value={phone}
              onChange={(e) => setPhone(e.currentTarget.value)}
            />
            <Button type="submit" fullWidth size="lg">
              Подтвердить запись
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
