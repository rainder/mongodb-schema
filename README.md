# MongoDB Schema

## Example usage


##### connection.ts

```typescript
import { createConnection } from '@rainder/mongodb-schema';

export const connection = createConnection('mongodb://127.0.0.1:27017');
```

##### user.model.ts

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
  logMe() {
    console.log(this.doc);
  }
}

```

##### index.ts

```typescript
import { ObjectId } from '@rainder/mongodb-schema';
import { User } from './user.model';

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
  .then((users: User[]) => {
    console.log(users)
  });

User.findOneAndUpdate({
  _id: new ObjectId('000000000000000000000001'),
}, {
  $set: {
    name: 'Andy',
  }
}, {
  returnOriginal: false, 
}).then((user) => {
  user.logMe();
});
```
