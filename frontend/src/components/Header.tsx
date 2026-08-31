import { Link, useLocation } from 'react-router-dom';
import { Group, Button, Box, Container } from '@mantine/core';
import {
  IconCalendar,
  IconCalendarEvent,
  IconSettings,
} from '@tabler/icons-react';

export function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <Box
      component="header"
      py="xs"
      px="md"
      style={{ borderBottom: '1px solid #2c2e33' }}
    >
      <Container size="xl">
        <Group justify="space-between">
          <Group>
            <Button
              component={Link}
              to="/"
              variant="subtle"
              c="white"
              leftSection={<IconCalendar size={20} />}
              size="lg"
              fw={700}
            >
              Календарь звонков
            </Button>
          </Group>

          <Group gap="xs">
            <Button
              component={Link}
              to="/event-types"
              variant={location.pathname === '/event-types' ? 'filled' : 'subtle'}
              c="white"
              leftSection={<IconCalendarEvent size={18} />}
            >
              События
            </Button>
            <Button
              component={Link}
              to="/admin/event-types"
              variant={isAdmin ? 'filled' : 'subtle'}
              c="white"
              leftSection={<IconSettings size={18} />}
            >
              Админ
            </Button>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
