import { User } from "../../core/models/user/User.model";
import { LocalStorage } from './localStorage';

export class UserHelper {

  /**
   * determine wheather or not a user is authenticate
   */
  static isConnect(): boolean {
    const user = LocalStorage.getItem('KIKEVENTADMIN_space_user');
    return !!user;
  }
  /**
   * Remove user data to the local DB
   */
  static logoutUser(): void {
    LocalStorage.delete('KIKEVENTADMIN_space_user');
    localStorage.removeItem('KIKEVENTADMIN_space_token');
  }

  static getUser(): User | null {
    const raw = LocalStorage.getItem('KIKEVENTADMIN_space_user');
    return raw ? (JSON.parse(raw) as User) : null;
  }

  static getUserId(): string | number | null {
    const user = this.getUser() as any;
    return user?.id ?? null;
  }

  /**
   * Add user data to the local DB
   * @param * user user object to be saved
   */
  static saveUser(user: User | any, token: string): void {
    LocalStorage.setItem('KIKEVENTADMIN_space_user', JSON.stringify(user));
    LocalStorage.setItem('KIKEVENTADMIN_space_token', token);
  }
  
}
