import * as bcrypt from 'bcrypt';

export async function generateHashedPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}
