# Relay

Relay is a calm, local-first relationship follow-up companion built with Expo and React Native. It helps you remember the people who matter, choose a check-in rhythm, and take one thoughtful action at a time.

## What is included

- **Today:** a daily relay with due follow-ups, completion, and 3-day snoozing.
- **People:** a searchable local circle with notes and upcoming check-ins.
- **Add flow:** create a person with a relationship, memory cue, and weekly/monthly/quarterly cadence.
- **Private by default:** data is persisted with AsyncStorage on the device; no account or server sync is required.
- **Relay identity:** warm cream, ink navy, and coral visual system with a custom loop-and-spark mark.

## Run locally

```bash
pnpm install
pnpm dev
```

For a quick validation pass:

```bash
pnpm check
pnpm lint
pnpm test
```

## Stack

Expo SDK 54, React Native 0.81, Expo Router 6, TypeScript, NativeWind, AsyncStorage, and Vitest.

## Privacy note

Relay's relationship data is stored locally on the device. The server scaffold included by the Expo template is not used for the core follow-up experience.
