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
import type { Dayjs } from 'dayjs';
import { nowMsk, toMsk } from '@/lib/datetime';
import type { Slot } from '@/types';

interface SlotPickerProps {
  slots: Slot[];
  selectedDate: Dayjs;
  selectedSlot: Slot | null;
  onDateSelect: (date: Dayjs) => void;
  onSlotSelect: (slot: Slot) => void;
}

export function SlotPicker({
  slots,
  selectedDate,
  selectedSlot,
  onDateSelect,
  onSlotSelect,
}: SlotPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => nowMsk());
  const [timeFormat, setTimeFormat] = useState<string>('24');

  const days = useMemo(() => {
    const start = currentMonth.startOf('month');
    const end = currentMonth.endOf('month');
    const daysInMonth = end.date();
    const startDay = start.day();

    const result: (Dayjs | null)[] = [];
    for (let i = 0; i < startDay; i++) {
      result.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(start.date(i));
    }
    return result;
  }, [currentMonth]);

  const dayKey = (date: Dayjs) => date.format('YYYY-MM-DD');

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      const key = dayKey(toMsk(slot.start));
      const arr = map.get(key);
      if (arr) {
        arr.push(slot);
      } else {
        map.set(key, [slot]);
      }
    }
    return map;
  }, [slots]);

  const availableDates = useMemo(() => {
    const set = new Set<string>();
    for (const slot of slots) {
      if (slot.available) {
        set.add(dayKey(toMsk(slot.start)));
      }
    }
    return set;
  }, [slots]);

  const availableSlotsForDate = (slotsByDay.get(dayKey(selectedDate)) ?? []).filter(
    (s) => s.available,
  );

  const weekDays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

  const formatTime = (time: string) => {
    if (timeFormat === '12') {
      return toMsk(time).format('hh:mm A');
    }
    return toMsk(time).format('HH:mm');
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
              const isToday = day && day.isSame(nowMsk(), 'day');
              const hasSlots = day && availableDates.has(dayKey(day));

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
