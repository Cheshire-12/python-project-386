import { useState, useMemo } from 'react';
import {
  Paper,
  Text,
  Group,
  Stack,
  Button,
  UnstyledButton,
  SimpleGrid,
  SegmentedControl,
} from '@mantine/core';
import {
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
  const [timeFormat, setTimeFormat] = useState<string>('24');

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

  const weekDays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

  const formatTime = (time: string) => {
    if (timeFormat === '12') {
      return dayjs(time).format('hh:mm A');
    }
    return dayjs(time).format('HH:mm');
  };

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
      {/* Calendar */}
      <Paper p="md" radius="md" style={{ backgroundColor: '#25262b' }}>
        <Stack gap="md">
          <Group justify="space-between">
            <UnstyledButton
              onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
            >
              <IconChevronLeft size={20} color="#909296" />
            </UnstyledButton>
            <Text fw={600} size="sm">
              {currentMonth.format('MMMM YYYY')}
            </Text>
            <UnstyledButton
              onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
            >
              <IconChevronRight size={20} color="#909296" />
            </UnstyledButton>
          </Group>

          <SimpleGrid cols={7} spacing="xs">
            {weekDays.map((d) => (
              <Text key={d} ta="center" size="xs" fw={600} c="dimmed">
                {d}
              </Text>
            ))}
            {days.map((day, i) => {
              const isSelected = day && day.isSame(selectedDate, 'day');
              const isToday = day && day.isSame(dayjs(), 'day');
              const hasSlots = day && slots.some((s) => dayjs(s.start).isSame(day, 'day') && s.available);

              return (
                <UnstyledButton
                  key={i}
                  onClick={() => day && onDateSelect(day)}
                  disabled={!day}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--mantine-radius-sm)',
                    backgroundColor: isSelected
                      ? '#fafafa'
                      : isToday
                        ? '#2c2e33'
                        : undefined,
                    color: isSelected ? '#1a1b1e' : '#fafafa',
                    cursor: day ? 'pointer' : 'default',
                    fontWeight: isSelected || isToday ? 600 : 400,
                    position: 'relative',
                  }}
                >
                  <Text size="sm">{day ? day.date() : ''}</Text>
                  {hasSlots && !isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: '#40c057',
                      }}
                    />
                  )}
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* Time slots */}
      <Paper p="md" radius="md" style={{ backgroundColor: '#25262b' }}>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>
              {selectedDate.format('ddd D')}
            </Text>
            <SegmentedControl
              value={timeFormat}
              onChange={(v) => setTimeFormat(v)}
              data={[
                { label: '12 ч', value: '12' },
                { label: '24ч', value: '24' },
              ]}
              size="xs"
              color="dark"
              styles={{
                root: { backgroundColor: '#1a1b1e' },
                indicator: { backgroundColor: '#373a40' },
                label: { color: '#909296' },
              }}
            />
          </Group>

          {availableSlotsForDate.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              Нет свободных слотов на эту дату
            </Text>
          ) : (
            <Stack gap="xs">
              {availableSlotsForDate.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <Button
                    key={slot.start}
                    variant={isSelected ? 'filled' : 'outline'}
                    color={isSelected ? 'green' : 'dark'}
                    onClick={() => onSlotSelect(slot)}
                    justify="center"
                    fullWidth
                    style={{
                      borderColor: '#373a40',
                      color: isSelected ? undefined : '#fafafa',
                    }}
                    leftSection={
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#40c057',
                        }}
                      />
                    }
                  >
                    {formatTime(slot.start)}
                  </Button>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Paper>
    </SimpleGrid>
  );
}
