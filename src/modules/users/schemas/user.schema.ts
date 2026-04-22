import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

/**
 * @Schema() maps this TypeScript class to a MongoDB collection.
 * timestamps: true automatically manages createdAt and updatedAt fields.
 */
@Schema({ timestamps: true })
export class User {
  /**
   * @Prop() defines a property in the document.
   * We can add validation like required: true, unique: true, or default values.
   */
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['Admin', 'Staff'], default: 'Staff' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * Mongoose Pre-save Hook:
 * This function runs automatically before a User document is saved to the database.
 * It hashes the user's password using bcrypt if it has been created or modified,
 * ensuring we never store plain-text passwords.
 */
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

/**
 * Instance Method:
 * We attach a method to the schema to easily compare passwords during login.
 */
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};
