import { InsulinRegisterScreen } from '@/features/insulin';
import { ProfileRequired } from '@/features/profile';

export default function Route() {
  return <ProfileRequired><InsulinRegisterScreen /></ProfileRequired>;
}
