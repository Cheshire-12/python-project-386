import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { GuestEventTypes } from './pages/GuestEventTypes';
import { GuestBooking } from './pages/GuestBooking';
import { BookingConfirmation } from './pages/BookingConfirmation';
import { AdminEventTypes } from './pages/AdminEventTypes';
import { AdminUpcoming } from './pages/AdminUpcoming';

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  colors: {
    dark: [
      '#c1c2c5',
      '#a6a7ab',
      '#909296',
      '#5c5f66',
      '#373a40',
      '#2c2e33',
      '#25262b',
      '#1a1b1e',
      '#141517',
      '#101113',
    ],
  },
});

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/event-types" element={<GuestEventTypes />} />
            <Route path="/event-types/:id" element={<GuestBooking />} />
            <Route path="/bookings/:id" element={<BookingConfirmation />} />
            <Route path="/admin/event-types" element={<AdminEventTypes />} />
            <Route path="/admin/upcoming" element={<AdminUpcoming />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
