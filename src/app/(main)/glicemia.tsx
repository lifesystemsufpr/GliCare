import { GlucoseRegisterScreen } from '@/features/glucose';
import { ProfileRequired } from '@/features/profile';

export default function Route() {
  return <ProfileRequired><GlucoseRegisterScreen /></ProfileRequired>;
}
