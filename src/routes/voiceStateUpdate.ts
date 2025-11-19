import { GuildMember, Message, VoiceState } from "discord.js";
import { Config } from "../config";
import { cancelTimer, startTimer } from "../utils/LockinTimer";
import ttsRole from "../constants/ttsRole";
import {
  timeouts,
  remainingTimeouts,
  lockInModeStartedTimestamp,
} from "../state/muteState";
import { muteDurationCache } from "../state/muteDurationCache";

export async function handleVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState
) {
  const member = newState.member as GuildMember;
  const userId = member.id;
  const isMuted = member.voice.mute;

  const hasBeenMuted = !oldState.serverMute && newState.serverMute;
  const hasBeenUnmuted = oldState.serverMute && !newState.serverMute;

  if (!member || !newState.guild) return;
  if (member.user.bot) return;

  const isInLockedVC =
    newState.channelId && Config.lockedVCIds.includes(newState.channelId);
  const hasStartedStreaming = !oldState.streaming && newState.streaming;
  const hasStoppedStreaming = oldState.streaming && !newState.streaming;
  const hasMuteRole = member.roles.cache.has(Config.muteRoleId);

  const hasJoinedVC = !oldState.channelId && newState.channelId;
  const hasLeftVC = oldState.channelId && !newState.channelId;

  if (hasMuteRole) {
    const shouldBeMuted = Boolean(isInLockedVC);
    if (isMuted !== shouldBeMuted) {
      await member.voice.setMute(shouldBeMuted);
    }

    if (isInLockedVC && hasStartedStreaming) {
      startTimer(userId, member);
    }

    if (hasStoppedStreaming || hasLeftVC) {
      cancelTimer(userId);
    }
  } else if (hasBeenMuted) {
    const lockInModeTimeRemaining =
      (lockInModeStartedTimestamp - Date.now()) / (1000 * 60);
    const mutedDuration = Math.random() < 0.5 ? 6 : 7;

    const cachedDuration = muteDurationCache.get(userId);
    let waitMinutes = lockInModeTimeRemaining > 0 ? lockInModeTimeRemaining : mutedDuration;

    if (cachedDuration !== undefined) {
      waitMinutes = cachedDuration / 60;
      muteDurationCache.delete(userId);
    }

    const waitDuration = 60 * waitMinutes * 1000;

    const timeout = timeouts.get(userId);
    if (timeout) {
      clearTimeout(timeout.timer);
      timeouts.delete(userId);
    }

    const channel = member.voice.channel;
    let sentMessage: Message | undefined = undefined;
    const roundedWaitMinutes = Math.round(waitMinutes);
    if (channel) {
      sentMessage = await channel.send(
        `<@${member.id
        }> has been muted for ${roundedWaitMinutes} minutes.\nUnmuting <t:${Math.floor(
          (Date.now() + waitDuration) / 1000
        )}:R>`
      );
    }
    const tts = member.roles.cache.has(ttsRole);
    if (tts) {
      member.roles.remove(ttsRole);
    }

    const createdTimeout = setTimeout(() => {
      timeouts.delete(userId);
      if (!member.voice.channelId) return;
      member.voice?.setMute(false);

      if (tts) {
        member.roles.add(ttsRole);
      }

      if (sentMessage) {
        sentMessage.edit(`${member.user.displayName} has been unmuted.`);
      }
    }, waitDuration);

    timeouts.set(userId, {
      timer: createdTimeout,
      timestamp: Date.now() + waitDuration,
      message: sentMessage,
      tts,
    });
  } else if (hasBeenUnmuted) {
    const timeout = timeouts.get(userId);
    const tts = timeout?.tts;
    if (timeout) {
      if (tts) {
        member.roles.add(ttsRole);
      }
      timeout.message?.edit(`${member.user.displayName} has been unmuted.`);
      timeouts.delete(userId);
      clearTimeout(timeout.timer);
    }
  } else if (hasJoinedVC) {
    const remainingTimeout = remainingTimeouts.get(userId);
    const isLockInMode = lockInModeStartedTimestamp > Date.now();
    const lockInModeTimeRemaining =
      (lockInModeStartedTimestamp - Date.now()) / (1000 * 60);
    const tts = remainingTimeout?.tts;
    if (!remainingTimeout && !isLockInMode) return;

    if (!newState.serverMute && isLockInMode) {
      member.voice?.setMute(true);
      return;
    }

    const timeRemaining =
      remainingTimeout?.timeRemaining || lockInModeTimeRemaining;

    const channel = member.voice.channel;
    if (!channel) return;

    remainingTimeouts.delete(userId);

    let sentMessage = await channel.send(
      `<@${member.id}> is still muted.\nUnmuting <t:${Math.floor(
        (Date.now() + timeRemaining) / 1000
      )}:R>`
    );

    const createdTimeout = setTimeout(() => {
      timeouts.delete(userId);
      if (!member.voice.channelId) return;
      member.voice?.setMute(false);

      if (tts) {
        member.roles.add(ttsRole);
      }

      sentMessage.edit(`${member.user.displayName} has been unmuted.`);
    }, timeRemaining);

    timeouts.set(userId, {
      timer: createdTimeout,
      timestamp: Date.now() + timeRemaining,
      message: sentMessage,
      tts,
    });
  } else if (hasLeftVC) {
    const timeout = timeouts.get(userId);
    const tts = timeout?.tts;
    if (timeout) {
      remainingTimeouts.set(userId, {
        timeRemaining: timeout.timestamp - Date.now(),
        tts,
      });

      timeout.message?.edit(
        `${member.user.displayName} left the voice channel.`
      );

      timeouts.delete(userId);
      clearTimeout(timeout.timer);
    }
  }
}
