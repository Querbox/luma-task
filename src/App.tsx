import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Focus } from './pages/Focus';
import { Calendar } from './pages/Calendar';
import { Heatmap } from './pages/Heatmap';
import { Settings } from './pages/Settings';
import { TaskProvider } from './context/TaskContext';
import { NotificationProvider } from './context/NotificationContext';
import { NetworkProvider } from './context/NetworkContext';
import { ToastContainer } from './components/ui/Toast';

function App() {
  return (
    <BrowserRouter basename="/luma-task">
      <NetworkProvider>
        <NotificationProvider>
          <TaskProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Focus />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="heatmap" element={<Heatmap />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
            <ToastContainer />
          </TaskProvider>
        </NotificationProvider>
      </NetworkProvider>
    </BrowserRouter>
  );
}

export default App;
