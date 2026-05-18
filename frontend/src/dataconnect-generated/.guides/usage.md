# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateUser, useUpdateUserProfile, useUpdateUserRole, useDeleteUser, useCreateEvent, useUpdateEvent, useDeleteEvent, useCheckIn, useGetUserByLineId, useGetUserById } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateUser(createUserVars);

const { data, isPending, isSuccess, isError, error } = useUpdateUserProfile(updateUserProfileVars);

const { data, isPending, isSuccess, isError, error } = useUpdateUserRole(updateUserRoleVars);

const { data, isPending, isSuccess, isError, error } = useDeleteUser(deleteUserVars);

const { data, isPending, isSuccess, isError, error } = useCreateEvent(createEventVars);

const { data, isPending, isSuccess, isError, error } = useUpdateEvent(updateEventVars);

const { data, isPending, isSuccess, isError, error } = useDeleteEvent(deleteEventVars);

const { data, isPending, isSuccess, isError, error } = useCheckIn(checkInVars);

const { data, isPending, isSuccess, isError, error } = useGetUserByLineId(getUserByLineIdVars);

const { data, isPending, isSuccess, isError, error } = useGetUserById(getUserByIdVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, updateUserProfile, updateUserRole, deleteUser, createEvent, updateEvent, deleteEvent, checkIn, getUserByLineId, getUserById } from '@dataconnect/generated';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation UpdateUserProfile:  For variables, look at type UpdateUserProfileVars in ../index.d.ts
const { data } = await UpdateUserProfile(dataConnect, updateUserProfileVars);

// Operation UpdateUserRole:  For variables, look at type UpdateUserRoleVars in ../index.d.ts
const { data } = await UpdateUserRole(dataConnect, updateUserRoleVars);

// Operation DeleteUser:  For variables, look at type DeleteUserVars in ../index.d.ts
const { data } = await DeleteUser(dataConnect, deleteUserVars);

// Operation CreateEvent:  For variables, look at type CreateEventVars in ../index.d.ts
const { data } = await CreateEvent(dataConnect, createEventVars);

// Operation UpdateEvent:  For variables, look at type UpdateEventVars in ../index.d.ts
const { data } = await UpdateEvent(dataConnect, updateEventVars);

// Operation DeleteEvent:  For variables, look at type DeleteEventVars in ../index.d.ts
const { data } = await DeleteEvent(dataConnect, deleteEventVars);

// Operation CheckIn:  For variables, look at type CheckInVars in ../index.d.ts
const { data } = await CheckIn(dataConnect, checkInVars);

// Operation GetUserByLineId:  For variables, look at type GetUserByLineIdVars in ../index.d.ts
const { data } = await GetUserByLineId(dataConnect, getUserByLineIdVars);

// Operation GetUserById:  For variables, look at type GetUserByIdVars in ../index.d.ts
const { data } = await GetUserById(dataConnect, getUserByIdVars);


```