import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcrypt'

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    // This will be hashed before saving
    validate: pass => {
        if (!pass?.length || pass.length < 5) {
            new Error('Password must be at least 5 characters');
            return false;
        }
    },
  },
  role: {
    type: String,
    enum: ['guest', 'customer', 'admin'],
    default: 'guest',
  },
  name: { type: String, required: true },
  companyname: { type: String, required: true },
}, { timestamps: true });

UserSchema.post('validate', function (user) {
    const notHashedPassword = user.password;
    const salt = bcrypt.genSaltSync(10);
    user.password =  bcrypt.hashSync(notHashedPassword, salt);
})

export const User = models?.User || model('User', UserSchema);
