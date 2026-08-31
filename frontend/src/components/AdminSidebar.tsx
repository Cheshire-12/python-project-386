import { Link, useLocation } from 'react-router-dom';
import { Stack, Button, Text, Divider } from '@mantine/core';
import {
  IconCalendarEvent,
  IconCalendar,
} from '@tabler/icons-react';

const navItems = [
  {
    label: 'Типы событий',
    path: '/admin/event-types',
    icon: IconCalendarEvent,
  },
  {
    label: 'Предстоящие встречи',
    path: '/admin/upcoming',
    icon: IconCalendar,
  },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Stack gap="xs" p="md" w={240} style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}>
      <Text fw={700} size="lg" px="sm" py="xs">
        Админ
      </Text>
      <Divider />
      {navItems.map((item) => (
        <Button
          key={item.path}
          component={Link}
          to={item.path}
          variant={location.pathname === item.path ? 'filled' : 'subtle'}
          leftSection={<item.icon size={18} />}
          justify="flex-start"
          fullWidth
        >
          {item.label}
        </Button>
      ))}
    </Stack>
  );
}
