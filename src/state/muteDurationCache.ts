// In-memory cache for temporary mute durations (in minutes)
// Key: userId, Value: duration in minutes
export const muteDurationCache = new Map<string, number>();

