import { PubSub } from "apollo-server"

import * as INVOICE_EVENTS from "./invoice"

export const EVENTS = { INVOICE: INVOICE_EVENTS }

export default new PubSub()
