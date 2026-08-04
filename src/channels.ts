/**
 * The one private broadcast channel this package subscribes to, and the events
 * it carries.
 *
 * The channel name must match the backend's `BulbStatusEvent::broadcastOn()`
 * (`new PrivateChannel('clarion-app-wizlights')`), and it must be subscribed
 * with `Echo.private` — a public `Echo.channel` subscription to a private
 * channel does not error, it connects and then silently receives nothing.
 *
 * Event names carry a leading dot so Echo treats them as fully-qualified class
 * names rather than prefixing them with the app namespace.
 */
export const WIZLIGHT_CHANNEL = "clarion-app-wizlights";

export const BULB_STATUS_EVENT =
  ".ClarionApp\\WizlightBackend\\Events\\BulbStatusEvent";

export const BULB_COMMAND_FAILED_EVENT =
  ".ClarionApp\\WizlightBackend\\Events\\BulbCommandFailedEvent";
