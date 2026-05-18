import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export enum IdentityOrientation {
  gay_lesbian = "gay_lesbian",
  bisexual = "bisexual",
  straight = "straight",
  transgender = "transgender",
  other = "other",
};

export enum SexAtBirth {
  male = "male",
  female = "female",
  intersex = "intersex",
};

export enum UserRole {
  pastor = "pastor",
  member = "member",
};



export interface CheckInData {
  checkin_insert: Checkin_Key;
  user_update?: User_Key | null;
}

export interface CheckInVariables {
  eventId: UUIDString;
  userId: UUIDString;
}

export interface Checkin_Key {
  id: UUIDString;
  __typename?: 'Checkin_Key';
}

export interface CreateEventData {
  event_insert: Event_Key;
}

export interface CreateEventVariables {
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: TimestampString;
  endsAt?: TimestampString | null;
  createdById: UUIDString;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  lineId: string;
}

export interface DeleteEventData {
  event_delete?: Event_Key | null;
}

export interface DeleteEventVariables {
  id: UUIDString;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface DeleteUserVariables {
  id: UUIDString;
}

export interface Event_Key {
  id: UUIDString;
  __typename?: 'Event_Key';
}

export interface GetEventByCheckinCodeData {
  events: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    location?: string | null;
    startsAt: TimestampString;
    endsAt?: TimestampString | null;
  } & Event_Key)[];
}

export interface GetEventByCheckinCodeVariables {
  checkinCode: UUIDString;
}

export interface GetEventByIdData {
  event?: {
    id: UUIDString;
    title: string;
    description?: string | null;
    location?: string | null;
    startsAt: TimestampString;
    endsAt?: TimestampString | null;
    checkinCode: UUIDString;
    createdById?: UUIDString | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & Event_Key;
}

export interface GetEventByIdVariables {
  id: UUIDString;
}

export interface GetUserByIdData {
  user?: {
    id: UUIDString;
    lineId: string;
    firstName?: string | null;
    lastName?: string | null;
    nickname?: string | null;
    birthdate?: DateString | null;
    email?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    sexAtBirth?: SexAtBirth | null;
    identityOrientation?: IdentityOrientation | null;
    identityOrientationOther?: string | null;
    christianDuration?: number | null;
    church?: string | null;
    selfIntroduction?: string | null;
    points: number;
    role: UserRole;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & User_Key;
}

export interface GetUserByIdVariables {
  id: UUIDString;
}

export interface GetUserByLineIdData {
  users: ({
    id: UUIDString;
    lineId: string;
    firstName?: string | null;
    lastName?: string | null;
    nickname?: string | null;
    birthdate?: DateString | null;
    email?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    sexAtBirth?: SexAtBirth | null;
    identityOrientation?: IdentityOrientation | null;
    identityOrientationOther?: string | null;
    christianDuration?: number | null;
    church?: string | null;
    selfIntroduction?: string | null;
    points: number;
    role: UserRole;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & User_Key)[];
}

export interface GetUserByLineIdVariables {
  lineId: string;
}

export interface ListEventCheckinsData {
  checkins: ({
    id: UUIDString;
    checkedInAt: TimestampString;
    user: {
      id: UUIDString;
      firstName?: string | null;
      lastName?: string | null;
      nickname?: string | null;
    } & User_Key;
  } & Checkin_Key)[];
}

export interface ListEventCheckinsVariables {
  eventId: UUIDString;
}

export interface ListEventsData {
  events: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    location?: string | null;
    startsAt: TimestampString;
    endsAt?: TimestampString | null;
    checkinCode: UUIDString;
    createdById?: UUIDString | null;
    createdAt: TimestampString;
  } & Event_Key)[];
}

export interface ListUserCheckinsData {
  checkins: ({
    id: UUIDString;
    checkedInAt: TimestampString;
    event: {
      id: UUIDString;
      title: string;
      location?: string | null;
      startsAt: TimestampString;
    } & Event_Key;
  } & Checkin_Key)[];
}

export interface ListUserCheckinsVariables {
  userId: UUIDString;
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    firstName?: string | null;
    lastName?: string | null;
    nickname?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    points: number;
    role: UserRole;
    createdAt: TimestampString;
  } & User_Key)[];
}

export interface UpdateEventData {
  event_update?: Event_Key | null;
}

export interface UpdateEventVariables {
  id: UUIDString;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: TimestampString;
  endsAt?: TimestampString | null;
}

export interface UpdateUserProfileData {
  user_update?: User_Key | null;
}

export interface UpdateUserProfileVariables {
  id: UUIDString;
  firstName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
  birthdate?: DateString | null;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  sexAtBirth?: SexAtBirth | null;
  identityOrientation?: IdentityOrientation | null;
  identityOrientationOther?: string | null;
  christianDuration?: number | null;
  church?: string | null;
  selfIntroduction?: string | null;
}

export interface UpdateUserRoleData {
  user_update?: User_Key | null;
}

export interface UpdateUserRoleVariables {
  id: UUIDString;
  role: UserRole;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface UpdateUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
  operationName: string;
}
export const updateUserProfileRef: UpdateUserProfileRef;

export function updateUserProfile(vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;
export function updateUserProfile(dc: DataConnect, vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface UpdateUserRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserRoleVariables): MutationRef<UpdateUserRoleData, UpdateUserRoleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserRoleVariables): MutationRef<UpdateUserRoleData, UpdateUserRoleVariables>;
  operationName: string;
}
export const updateUserRoleRef: UpdateUserRoleRef;

export function updateUserRole(vars: UpdateUserRoleVariables): MutationPromise<UpdateUserRoleData, UpdateUserRoleVariables>;
export function updateUserRole(dc: DataConnect, vars: UpdateUserRoleVariables): MutationPromise<UpdateUserRoleData, UpdateUserRoleVariables>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;
export function deleteUser(dc: DataConnect, vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;

interface CreateEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEventVariables): MutationRef<CreateEventData, CreateEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateEventVariables): MutationRef<CreateEventData, CreateEventVariables>;
  operationName: string;
}
export const createEventRef: CreateEventRef;

export function createEvent(vars: CreateEventVariables): MutationPromise<CreateEventData, CreateEventVariables>;
export function createEvent(dc: DataConnect, vars: CreateEventVariables): MutationPromise<CreateEventData, CreateEventVariables>;

interface UpdateEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateEventVariables): MutationRef<UpdateEventData, UpdateEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateEventVariables): MutationRef<UpdateEventData, UpdateEventVariables>;
  operationName: string;
}
export const updateEventRef: UpdateEventRef;

export function updateEvent(vars: UpdateEventVariables): MutationPromise<UpdateEventData, UpdateEventVariables>;
export function updateEvent(dc: DataConnect, vars: UpdateEventVariables): MutationPromise<UpdateEventData, UpdateEventVariables>;

interface DeleteEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteEventVariables): MutationRef<DeleteEventData, DeleteEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteEventVariables): MutationRef<DeleteEventData, DeleteEventVariables>;
  operationName: string;
}
export const deleteEventRef: DeleteEventRef;

export function deleteEvent(vars: DeleteEventVariables): MutationPromise<DeleteEventData, DeleteEventVariables>;
export function deleteEvent(dc: DataConnect, vars: DeleteEventVariables): MutationPromise<DeleteEventData, DeleteEventVariables>;

interface CheckInRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CheckInVariables): MutationRef<CheckInData, CheckInVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CheckInVariables): MutationRef<CheckInData, CheckInVariables>;
  operationName: string;
}
export const checkInRef: CheckInRef;

export function checkIn(vars: CheckInVariables): MutationPromise<CheckInData, CheckInVariables>;
export function checkIn(dc: DataConnect, vars: CheckInVariables): MutationPromise<CheckInData, CheckInVariables>;

interface GetUserByLineIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByLineIdVariables): QueryRef<GetUserByLineIdData, GetUserByLineIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByLineIdVariables): QueryRef<GetUserByLineIdData, GetUserByLineIdVariables>;
  operationName: string;
}
export const getUserByLineIdRef: GetUserByLineIdRef;

export function getUserByLineId(vars: GetUserByLineIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByLineIdData, GetUserByLineIdVariables>;
export function getUserByLineId(dc: DataConnect, vars: GetUserByLineIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByLineIdData, GetUserByLineIdVariables>;

interface GetUserByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
  operationName: string;
}
export const getUserByIdRef: GetUserByIdRef;

export function getUserById(vars: GetUserByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByIdData, GetUserByIdVariables>;
export function getUserById(dc: DataConnect, vars: GetUserByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByIdData, GetUserByIdVariables>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEventsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListEventsData, undefined>;
  operationName: string;
}
export const listEventsRef: ListEventsRef;

export function listEvents(options?: ExecuteQueryOptions): QueryPromise<ListEventsData, undefined>;
export function listEvents(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListEventsData, undefined>;

interface GetEventByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEventByIdVariables): QueryRef<GetEventByIdData, GetEventByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEventByIdVariables): QueryRef<GetEventByIdData, GetEventByIdVariables>;
  operationName: string;
}
export const getEventByIdRef: GetEventByIdRef;

export function getEventById(vars: GetEventByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetEventByIdData, GetEventByIdVariables>;
export function getEventById(dc: DataConnect, vars: GetEventByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetEventByIdData, GetEventByIdVariables>;

interface GetEventByCheckinCodeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEventByCheckinCodeVariables): QueryRef<GetEventByCheckinCodeData, GetEventByCheckinCodeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEventByCheckinCodeVariables): QueryRef<GetEventByCheckinCodeData, GetEventByCheckinCodeVariables>;
  operationName: string;
}
export const getEventByCheckinCodeRef: GetEventByCheckinCodeRef;

export function getEventByCheckinCode(vars: GetEventByCheckinCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetEventByCheckinCodeData, GetEventByCheckinCodeVariables>;
export function getEventByCheckinCode(dc: DataConnect, vars: GetEventByCheckinCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetEventByCheckinCodeData, GetEventByCheckinCodeVariables>;

interface ListEventCheckinsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListEventCheckinsVariables): QueryRef<ListEventCheckinsData, ListEventCheckinsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListEventCheckinsVariables): QueryRef<ListEventCheckinsData, ListEventCheckinsVariables>;
  operationName: string;
}
export const listEventCheckinsRef: ListEventCheckinsRef;

export function listEventCheckins(vars: ListEventCheckinsVariables, options?: ExecuteQueryOptions): QueryPromise<ListEventCheckinsData, ListEventCheckinsVariables>;
export function listEventCheckins(dc: DataConnect, vars: ListEventCheckinsVariables, options?: ExecuteQueryOptions): QueryPromise<ListEventCheckinsData, ListEventCheckinsVariables>;

interface ListUserCheckinsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListUserCheckinsVariables): QueryRef<ListUserCheckinsData, ListUserCheckinsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListUserCheckinsVariables): QueryRef<ListUserCheckinsData, ListUserCheckinsVariables>;
  operationName: string;
}
export const listUserCheckinsRef: ListUserCheckinsRef;

export function listUserCheckins(vars: ListUserCheckinsVariables, options?: ExecuteQueryOptions): QueryPromise<ListUserCheckinsData, ListUserCheckinsVariables>;
export function listUserCheckins(dc: DataConnect, vars: ListUserCheckinsVariables, options?: ExecuteQueryOptions): QueryPromise<ListUserCheckinsData, ListUserCheckinsVariables>;

