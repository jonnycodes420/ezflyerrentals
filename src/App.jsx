import ReservationForm from './components/ReservationForm';
import AdminView from './components/AdminView';

export default function App() {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
  return isAdmin ? <AdminView /> : <ReservationForm />;
}
