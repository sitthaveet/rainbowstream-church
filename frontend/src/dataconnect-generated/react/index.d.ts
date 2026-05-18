import { CreateUserData, CreateUserVariables, UpdateUserProfileData, UpdateUserProfileVariables, UpdateUserRoleData, UpdateUserRoleVariables, DeleteUserData, DeleteUserVariables, CreateEventData, CreateEventVariables, UpdateEventData, UpdateEventVariables, DeleteEventData, DeleteEventVariables, CheckInData, CheckInVariables, GetUserByLineIdData, GetUserByLineIdVariables, GetUserByIdData, GetUserByIdVariables, ListUsersData, ListEventsData, GetEventByIdData, GetEventByIdVariables, GetEventByCheckinCodeData, GetEventByCheckinCodeVariables, ListEventCheckinsData, ListEventCheckinsVariables, ListUserCheckinsData, ListUserCheckinsVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useUpdateUserProfile(options?: useDataConnectMutationOptions<UpdateUserProfileData, FirebaseError, UpdateUserProfileVariables>): UseDataConnectMutationResult<UpdateUserProfileData, UpdateUserProfileVariables>;
export function useUpdateUserProfile(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserProfileData, FirebaseError, UpdateUserProfileVariables>): UseDataConnectMutationResult<UpdateUserProfileData, UpdateUserProfileVariables>;

export function useUpdateUserRole(options?: useDataConnectMutationOptions<UpdateUserRoleData, FirebaseError, UpdateUserRoleVariables>): UseDataConnectMutationResult<UpdateUserRoleData, UpdateUserRoleVariables>;
export function useUpdateUserRole(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserRoleData, FirebaseError, UpdateUserRoleVariables>): UseDataConnectMutationResult<UpdateUserRoleData, UpdateUserRoleVariables>;

export function useDeleteUser(options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, DeleteUserVariables>): UseDataConnectMutationResult<DeleteUserData, DeleteUserVariables>;
export function useDeleteUser(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, DeleteUserVariables>): UseDataConnectMutationResult<DeleteUserData, DeleteUserVariables>;

export function useCreateEvent(options?: useDataConnectMutationOptions<CreateEventData, FirebaseError, CreateEventVariables>): UseDataConnectMutationResult<CreateEventData, CreateEventVariables>;
export function useCreateEvent(dc: DataConnect, options?: useDataConnectMutationOptions<CreateEventData, FirebaseError, CreateEventVariables>): UseDataConnectMutationResult<CreateEventData, CreateEventVariables>;

export function useUpdateEvent(options?: useDataConnectMutationOptions<UpdateEventData, FirebaseError, UpdateEventVariables>): UseDataConnectMutationResult<UpdateEventData, UpdateEventVariables>;
export function useUpdateEvent(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateEventData, FirebaseError, UpdateEventVariables>): UseDataConnectMutationResult<UpdateEventData, UpdateEventVariables>;

export function useDeleteEvent(options?: useDataConnectMutationOptions<DeleteEventData, FirebaseError, DeleteEventVariables>): UseDataConnectMutationResult<DeleteEventData, DeleteEventVariables>;
export function useDeleteEvent(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteEventData, FirebaseError, DeleteEventVariables>): UseDataConnectMutationResult<DeleteEventData, DeleteEventVariables>;

export function useCheckIn(options?: useDataConnectMutationOptions<CheckInData, FirebaseError, CheckInVariables>): UseDataConnectMutationResult<CheckInData, CheckInVariables>;
export function useCheckIn(dc: DataConnect, options?: useDataConnectMutationOptions<CheckInData, FirebaseError, CheckInVariables>): UseDataConnectMutationResult<CheckInData, CheckInVariables>;

export function useGetUserByLineId(vars: GetUserByLineIdVariables, options?: useDataConnectQueryOptions<GetUserByLineIdData>): UseDataConnectQueryResult<GetUserByLineIdData, GetUserByLineIdVariables>;
export function useGetUserByLineId(dc: DataConnect, vars: GetUserByLineIdVariables, options?: useDataConnectQueryOptions<GetUserByLineIdData>): UseDataConnectQueryResult<GetUserByLineIdData, GetUserByLineIdVariables>;

export function useGetUserById(vars: GetUserByIdVariables, options?: useDataConnectQueryOptions<GetUserByIdData>): UseDataConnectQueryResult<GetUserByIdData, GetUserByIdVariables>;
export function useGetUserById(dc: DataConnect, vars: GetUserByIdVariables, options?: useDataConnectQueryOptions<GetUserByIdData>): UseDataConnectQueryResult<GetUserByIdData, GetUserByIdVariables>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;

export function useListEvents(options?: useDataConnectQueryOptions<ListEventsData>): UseDataConnectQueryResult<ListEventsData, undefined>;
export function useListEvents(dc: DataConnect, options?: useDataConnectQueryOptions<ListEventsData>): UseDataConnectQueryResult<ListEventsData, undefined>;

export function useGetEventById(vars: GetEventByIdVariables, options?: useDataConnectQueryOptions<GetEventByIdData>): UseDataConnectQueryResult<GetEventByIdData, GetEventByIdVariables>;
export function useGetEventById(dc: DataConnect, vars: GetEventByIdVariables, options?: useDataConnectQueryOptions<GetEventByIdData>): UseDataConnectQueryResult<GetEventByIdData, GetEventByIdVariables>;

export function useGetEventByCheckinCode(vars: GetEventByCheckinCodeVariables, options?: useDataConnectQueryOptions<GetEventByCheckinCodeData>): UseDataConnectQueryResult<GetEventByCheckinCodeData, GetEventByCheckinCodeVariables>;
export function useGetEventByCheckinCode(dc: DataConnect, vars: GetEventByCheckinCodeVariables, options?: useDataConnectQueryOptions<GetEventByCheckinCodeData>): UseDataConnectQueryResult<GetEventByCheckinCodeData, GetEventByCheckinCodeVariables>;

export function useListEventCheckins(vars: ListEventCheckinsVariables, options?: useDataConnectQueryOptions<ListEventCheckinsData>): UseDataConnectQueryResult<ListEventCheckinsData, ListEventCheckinsVariables>;
export function useListEventCheckins(dc: DataConnect, vars: ListEventCheckinsVariables, options?: useDataConnectQueryOptions<ListEventCheckinsData>): UseDataConnectQueryResult<ListEventCheckinsData, ListEventCheckinsVariables>;

export function useListUserCheckins(vars: ListUserCheckinsVariables, options?: useDataConnectQueryOptions<ListUserCheckinsData>): UseDataConnectQueryResult<ListUserCheckinsData, ListUserCheckinsVariables>;
export function useListUserCheckins(dc: DataConnect, vars: ListUserCheckinsVariables, options?: useDataConnectQueryOptions<ListUserCheckinsData>): UseDataConnectQueryResult<ListUserCheckinsData, ListUserCheckinsVariables>;
