import { Link } from 'react-router-dom';
import { Container, Title, Text, Button, Stack, Group } from '@mantine/core';
import { IconCalendarEvent, IconArrowRight } from '@tabler/icons-react';

export function LandingPage() {
  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="xl" ta="center">
        <Title order={1} size="h1" fw={700}>
          Календарь звонков
        </Title>

        <Text size="lg" c="dimmed" maw={500}>
          Запишитесь на звонок с владельцем календаря. Выберите удобное время
          из доступных слотов на ближайшие 14 дней.
        </Text>

        <Group>
          <Button
            component={Link}
            to="/event-types"
            size="lg"
            leftSection={<IconCalendarEvent size={20} />}
            rightSection={<IconArrowRight size={18} />}
          >
            Выбрать событие
          </Button>
        </Group>

        <Text size="sm" c="dimmed">
          Таймзона: Europe/Moscow
        </Text>
      </Stack>
    </Container>
  );
}
