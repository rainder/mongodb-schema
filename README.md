# MongoDB Schema

## Example usage


##### connection.ts

```typescript
import { createConnection } from '@rainder/mongodb-schema';

export const connection = createConnection('mongodb://127.0.0.1:27017');
```

##### model.ts

```typescript
import { BaseModel, Model, Schema, ObjectId } from '@rainder/mongodb-schema';
import { connection } from '../connection';

export interface UserSchema extends Schema {
  name: string;
  email: string;
  gender?: string;

  created: Date;
}

@Model({
  connection: connection,
  collection_name: 'users',
  indexes: [{
    key: { email: 1 },
  }],
})
export class User extends BaseModel<UserSchema> {
  hi() {
    console.log(this);
  }
}

```

##### index.ts

```typescript
const user = new User({
  name: 'John',
  email: 'john@smith.com',
  created: new Date(),
});

user.save().then(() => {
  
});

User
  .find({ email: 'john@smith.com' })
  .then((cursor) => cursor.toArray())
  .then((users) => {
    console.log(users)
  });
```
