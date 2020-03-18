import { PubSub } from "apollo-server"

import { CREATED } from "./invoice"

export const EVENTS = { INVOICE: { CREATED } }

export default new PubSub()
