/**
 * Server-side Data Connect queries, pinned to `fetchPolicy: SERVER_ONLY`.
 *
 * The Firebase web SDK defaults queries to PREFER_CACHE and keeps results per
 * (operation, variables) inside the long-lived server process — verified
 * read-after-write staleness through the emulator: a PATCHed profile read
 * back its pre-write row in the very same request. Route handlers must always
 * see current database state, so every query goes through these wrappers.
 * Mutations are unaffected (they always execute on the server).
 */
import type { DataConnect } from "firebase/data-connect";
import {
  getUserByLineId as queryGetUserByLineId,
  getUserById as queryGetUserById,
  listUsers as queryListUsers,
  listEvents as queryListEvents,
  getEventById as queryGetEventById,
  getEventByCheckinCode as queryGetEventByCheckinCode,
  listEventCheckins as queryListEventCheckins,
  listUserCheckins as queryListUserCheckins,
  type GetUserByLineIdVariables,
  type GetUserByIdVariables,
  type GetEventByIdVariables,
  type GetEventByCheckinCodeVariables,
  type ListEventCheckinsVariables,
  type ListUserCheckinsVariables,
} from "@dataconnect/generated";

const SERVER_ONLY = { fetchPolicy: "SERVER_ONLY" as const };

export const getUserByLineId = (dc: DataConnect, vars: GetUserByLineIdVariables) =>
  queryGetUserByLineId(dc, vars, SERVER_ONLY);

export const getUserById = (dc: DataConnect, vars: GetUserByIdVariables) =>
  queryGetUserById(dc, vars, SERVER_ONLY);

export const listUsers = (dc: DataConnect) => queryListUsers(dc, SERVER_ONLY);

export const listEvents = (dc: DataConnect) => queryListEvents(dc, SERVER_ONLY);

export const getEventById = (dc: DataConnect, vars: GetEventByIdVariables) =>
  queryGetEventById(dc, vars, SERVER_ONLY);

export const getEventByCheckinCode = (
  dc: DataConnect,
  vars: GetEventByCheckinCodeVariables,
) => queryGetEventByCheckinCode(dc, vars, SERVER_ONLY);

export const listEventCheckins = (
  dc: DataConnect,
  vars: ListEventCheckinsVariables,
) => queryListEventCheckins(dc, vars, SERVER_ONLY);

export const listUserCheckins = (
  dc: DataConnect,
  vars: ListUserCheckinsVariables,
) => queryListUserCheckins(dc, vars, SERVER_ONLY);
