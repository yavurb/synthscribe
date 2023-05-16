import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { ApiScopes } from '../enums';
import { User } from './User.schema';

export type ApiKeyDocument = HydratedDocument<ApiKey>;

@Schema({ timestamps: true, versionKey: false })
export class ApiKey {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  prefix: string;

  @Prop({ required: true })
  lastFourDigits: string;

  @Prop({
    type: SchemaTypes.Array,
    default: [ApiScopes.GENERATE],
  })
  scopes: ApiScopes[];

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true })
  user: User;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
