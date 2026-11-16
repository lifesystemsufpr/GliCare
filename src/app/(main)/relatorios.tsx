import { ReportsScreen } from '@/features/reports';
import { ProfileRequired } from '@/features/profile';

export default function Route() {
  return <ProfileRequired><ReportsScreen /></ProfileRequired>;
}
