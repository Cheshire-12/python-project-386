import { useState, useMemo } from 'react';
import {
  SimpleGrid,
  Paper,
  Text,
  Group,
  Stack,
  Button,
  UnstyledButton,
  Badge,
} from '@mantine/core';
import {
  IconClock,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { Slot } from '@/types';

interface SlotPickerProps {
  slots: Slot[];
  selectedDate: dayjs.Dayjs;
  selectedSlot: Slot | null;
  onDateSelect: (date: dayjs.Dayjs) => void;
  onSlotSelect: (slot: Slot) => void;
}

export function SlotPicker({
  slots,
  selectedDate,
  selectedSlot,
  onDateSelect,
  onSlotSelect,
}: SlotPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const days = useMemo(() => {
    const start = currentMonth.startOf('month');
    const end = currentMonth.endOf('month');
    const daysInMonth = end.date();
    const startDay = start.day();

    const result: (dayjs.Dayjs | null)[] = [];
    for (let i = 0; i < startDay; i++) {
      result.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(start.date(i));
    }
    return result;
  }, [currentMonth]);

  const slotsForDate = useMemo(() => {
    return slots.filter((slot) =>
      dayjs(slot.start).isSame(selectedDate, 'day'),
    );
  }, [slots, selectedDate]);

  const availableSlotsForDate = slotsForDate.filter((s) => s.available);

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
              leftSection={<IconChevronLeft size={16} />}
            >
              {currentMonth.format('MMMM YYYY')}
            </Button>
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
              rightSection={<IconChevronRight size={16} />}
            />
          </Group>

          <SimpleGrid cols={7} spacing="xs">
            {weekDays.map((d) => (
              <Text key={d} ta="center" size="xs" fw={600} c="dimmed">
                {d}
              </Text>
            ))}
            {days.map((day, i) => (
              <UnstyledButton
                key={i}
                onClick={() => day && onDateSelect(day)}
                disabled={!day}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--mantine-radius-sm)',
                  backgroundColor:
                    day && day.isSame(selectedDate, 'day')
                      ? 'var(--mantine-color-blue-filled)'
                      : day && day.isSame(dayjs(), 'day')
                        ? 'var(--mantine-color-gray-1)'
                        : undefined,
                  color:
                    day && day.isSame(selectedDate, 'day')
                      ? 'white'
                      : undefined,
                  cursor: day ? 'pointer' : 'default',
                }}
              >
                <Text size="sm">{day ? day.date() : ''}</Text>
              </UnstyledButton>
            ))}
          </SimpleGrid>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group>
            <IconClock size={18} />
            <Text fw={600}>
              {selectedDate.format('D MMMM YYYY')}
            </Text>
            <Badge variant="light" color="blue">
              {availableSlotsForDate.length} слотов
            </Badge>
          </Group>

          {availableSlotsForDate.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              Нет свободных слотов на эту дату
            </Text>
          ) : (
            <SimpleGrid cols={2} spacing="xs">
              {availableSlotsForDate.map((slot) => (
                <Button
                  key={slot.start}
                  variant={
                    selectedSlot?.start === slot.start ? 'filled' : 'outline'
                  }
                  color={selectedSlot?.start === slot.start ? 'green' : 'gray'}
                  onClick={() => onSlotSelect(slot)}
                  size="compact-md"
                >
                  {dayjs(slot.start).format('HH:mm')}
                </Button>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Paper>
    </SimpleGrid>
  );
}
