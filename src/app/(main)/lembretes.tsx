import { RemindersScreen } from '@/features/reminders';
import { ProfileRequired } from '@/features/profile';

export default function Route() {
  return <ProfileRequired><RemindersScreen /></ProfileRequired>;
}
