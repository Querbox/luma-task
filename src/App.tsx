import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Focus } from './pages/Focus';
import { Calendar } from './pages/Calendar';
import { Heatmap } from './pages/Heatmap';
import { TaskProvider } from './context/TaskContext';

function App() {
  return (
    <BrowserRouter basename="/luma-task">
      <TaskProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Focus />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="heatmap" element={<Heatmap />} />
          </Route>
        </Routes>
      </TaskProvider>
    </BrowserRouter>
  );
}

export default App;
