import { Gender } from './user.entity';

export interface UserResult {
  id: string;
  username: string;
  name: string;
  birthdate: Date;
  gender: Gender;
  // audioBlocks: AudioBlock[];
  email: string;
  //password: string; //Password is NOT returned!
}
