import { createRef, RefObject } from "preact";
import { Signal } from "@preact/signals";

export class ReversiSoundService {
  readonly music: Record<ReversiMusic, RefObject<HTMLAudioElement>>;
  readonly effect: Record<ReversiEffect, RefObject<HTMLAudioElement>>;
  public playing: Signal<ReversiMusic | undefined> = new Signal(undefined);
  public effectVolume: Signal<number> = new Signal(1);
  readonly effectVolRef = createRef<HTMLInputElement>();
  public soundVolume: Signal<number> = new Signal(0.2);
  readonly musicVolRef = createRef<HTMLInputElement>();

  constructor() {
    this.music = {
      [ReversiMusic.Main]: createRef<HTMLAudioElement>(),
    };
    this.effect = {
      [ReversiEffect.Start]: createRef<HTMLAudioElement>(),
      [ReversiEffect.Put]: createRef<HTMLAudioElement>(),
      [ReversiEffect.RoundClear]: createRef<HTMLAudioElement>(),
      [ReversiEffect.GameClear]: createRef<HTMLAudioElement>(),
      [ReversiEffect.GameOver]: createRef<HTMLAudioElement>(),
      [ReversiEffect.Rerole]: createRef<HTMLAudioElement>(),
      [ReversiEffect.Purchase]: createRef<HTMLAudioElement>(),
      [ReversiEffect.Unlock]: createRef<HTMLAudioElement>(),
      [ReversiEffect.Reset]: createRef<HTMLAudioElement>(),
    };
  }

  play(type: ReversiEffect) {
    const ref = this.effect[type].current;
    if (ref) {
      ref.volume = this.effectVolume.value;
      ref.currentTime = 0;
      ref.play();
    }
  }

  begin(type: ReversiMusic) {
    const ref = this.music[type].current;
    if (ref) {
      this.playing.value = type;
      ref.currentTime = 0;
      ref.volume = this.soundVolume.value;
      ref.loop = true;
      ref.play();
    }
  }

  stop() {
    if (this.playing.value === undefined) return;
    const ref = this.music[this.playing.value].current;
    if (ref) {
      this.playing.value = undefined;
      ref.pause();
    }
  }

  onChangeMusicVol() {
    const inputRef = this.musicVolRef.current;
    if (inputRef) {
      this.soundVolume.value = parseFloat(inputRef.value);
      if (!this.playing.value) return;
      const ref = this.music[this.playing.value]?.current;
      if (ref) ref.volume = this.soundVolume.value;
    }
  }

  onChangeEffectVol() {
    const inputRef = this.effectVolRef.current;
    if (inputRef) {
      this.effectVolume.value = parseFloat(inputRef.value);
      this.play(ReversiEffect.Rerole);
    }
  }
}

export const ReversiEffect = {
  Start: "START",
  Put: "PUT",
  RoundClear: "ROUND_CLEAR",
  GameClear: "GAME_CLEAR",
  GameOver: "GAME_OVER",
  Rerole: "REROLE",
  Purchase: "PURCHASE",
  Unlock: "UNLOCK",
  Reset: "RESET",
} as const;
export type ReversiEffect = (typeof ReversiEffect)[keyof typeof ReversiEffect];

export const ReversiMusic = {
  Main: "MAIN",
} as const;
export type ReversiMusic = (typeof ReversiMusic)[keyof typeof ReversiMusic];
