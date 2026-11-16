import { DashboardScreen } from '@/features/dashboard';
import { ProfileRequired } from '@/features/profile';

export default function Route() {
  return <ProfileRequired><DashboardScreen /></ProfileRequired>;
}
