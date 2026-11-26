const MAX_CAPTURE_BYTES = 2 * 1024 * 1024;
const MAX_SPEECH_BYTES = 4 * 1024 * 1024;
const MAX_CAPTURE_MS = 45_000;
const INITIAL_SILENCE_MS = 15_000;
const END_SILENCE_MS = 560; // a shorter natural pause avoids unnecessary latency
const MIN_VOICE_MS = 240;
const VOICE_THRESHOLD = 0.012;
const SAMPLE_INTERVAL_MS = 40;

function runtime(dependencies = {}) {
  const win = typeof window === 'object' ? window : globalThis;
  const devices = globalThis.navigator?.mediaDevices;
  return {
    getUserMedia: devices?.getUserMedia?.bind(devices),
    MediaRecorder: win.MediaRecorder || globalThis.MediaRecorder,
    AudioContext: win.AudioContext || win.webkitAudioContext,
    now: () => globalThis.performance?.now?.() ?? Date.now(),
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    setInterval: globalThis.setInterval.bind(globalThis),
    clearInterval: globalThis.clearInterval.bind(globalThis),
    ...dependencies,
  };
}

function audioError(message, code) {
  return Object.assign(new Error(message), {code});
}

function abortError() {
  return typeof DOMException === 'function'
    ? new DOMException('Lecture annulée.', 'AbortError')
    : Object.assign(new Error('Lecture annulée.'), {name: 'AbortError'});
}

function microphoneError(error) {
  if (error?.code?.startsWith?.('VOICE_')) return error;
  if (['NotAllowedError', 'SecurityError'].includes(error?.name)) {
    return audioError('L’accès au micro a été refusé. Autorise le micro puis relance la conversation.', 'VOICE_PERMISSION');
  }
  if (error?.name === 'NotFoundError') {
    return audioError('Aucun micro n’est disponible sur ce téléphone.', 'VOICE_NO_MICROPHONE');
  }
  if (error?.name === 'NotReadableError') {
    return audioError('Le micro est déjà utilisé ou indisponible. Ferme l’autre appel puis réessaie.', 'VOICE_MICROPHONE_BUSY');
  }
  return audioError('Le micro n’a pas pu démarrer. Tu peux relancer la conversation.', 'VOICE_CAPTURE');
}

function stopTracks(stream) {
  for (const track of stream?.getTracks?.() || []) {
    try { track.stop(); } catch {}
  }
}

function closeContext(context) {
  try { Promise.resolve(context?.close?.()).catch(() => {}); } catch {}
}

function recorderType(Recorder) {
  const candidates = [
    'audio/webm;codecs=opus', 'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/ogg',
  ];
  return candidates.find(type => {
    try { return Recorder.isTypeSupported?.(type); } catch { return false; }
  });
}

/** Keep a single microphone permission for one active call. No recording during playback;
 * end() releases every track, including a permission request still pending. */
export function createCallInputLease(getUserMedia=globalThis.navigator?.mediaDevices?.getUserMedia?.bind(globalThis.navigator.mediaDevices)){
 let stream=null,pending=null,closed=false;
 return {
  async acquire(constraints){
   if(closed||!getUserMedia)throw audioError('Micro indisponible.','VOICE_UNSUPPORTED');
   if(!stream){pending??=Promise.resolve(getUserMedia(constraints)).then(s=>{if(closed){stopTracks(s);throw audioError('Appel terminé.','VOICE_INTERRUPTED');}stream=s;return s;}).finally(()=>pending=null);await pending;}
   if(closed||!stream)throw audioError('Appel terminé.','VOICE_INTERRUPTED');
   for(const track of stream.getTracks())track.enabled=true;return stream;
  },
  mute(s=stream){for(const track of s?.getTracks?.()||[])track.enabled=false;},
  close(){closed=true;stopTracks(stream);stream=null;}
 };
}

/** One utterance at a time. stop() is silent cancellation; errors never restart it. */
export function createVoiceCapture({onClip, onStatus, onError, onEnergy, audioContext, inputLease, dependencies} = {}) {
  const env = runtime(dependencies);
  const supported = Boolean(env.getUserMedia && env.MediaRecorder && (audioContext || env.AudioContext));
  let current = null;

  function releaseInput(session) {
    env.clearInterval(session.monitor);
    env.clearTimeout(session.initialTimer);
    env.clearTimeout(session.maxTimer);
    session.monitor = null;
    for (const [track, listener] of session.trackListeners || []) {
      track.removeEventListener?.('ended', listener);
    }
    session.trackListeners = [];
    try { session.source?.disconnect(); } catch {}
    try { session.analyser?.disconnect(); } catch {}
    session.source = null;
    session.analyser = null;
    if(inputLease)inputLease.mute(session.stream);else stopTracks(session.stream);
    session.stream = null;
    if (session.ownsContext) closeContext(session.context);
    session.context = null;
    onEnergy?.(0);
  }

  function clean(session) {
    env.clearTimeout(session.flushTimer);
    if (session.recorder) {
      session.recorder.ondataavailable = null;
      session.recorder.onstop = null;
      session.recorder.onerror = null;
      try {
        if (session.recorder.state !== 'inactive') session.recorder.stop();
      } catch {}
    }
    releaseInput(session);
    session.chunks = [];
  }

  function fail(session, error) {
    if (current !== session) return;
    current = null;
    session.cancelled = true;
    clean(session);
    onError?.(microphoneError(error));
  }

  function complete(session) {
    if (current !== session || session.cancelled) return;
    if (!session.ending) {
      fail(session, audioError('L’enregistrement a été interrompu. Relance la conversation.', 'VOICE_INTERRUPTED'));
      return;
    }
    if (session.voicedMs < MIN_VOICE_MS || !session.bytes) {
      fail(session, audioError('Je n’ai pas entendu de phrase. Relance le micro quand tu veux parler.', 'VOICE_SILENCE'));
      return;
    }
    const type = session.recorder.mimeType || session.chunks.find(chunk => chunk.type)?.type || session.mimeType;
    if (!/^audio\/(webm|mp4|ogg)(;|$)/i.test(type || '')) {
      fail(session, audioError('Ce téléphone a fourni un format audio non pris en charge.', 'VOICE_FORMAT'));
      return;
    }
    const clip = new Blob(session.chunks, {type});
    current = null;
    clean(session);
    onClip?.(clip);
  }

  function finish() {
    const session = current;
    if (!session || session.ending) return false;
    if (!session.recorder || session.voicedMs < MIN_VOICE_MS) {
      fail(session, audioError('Je n’ai pas entendu de phrase. Relance le micro quand tu veux parler.', 'VOICE_SILENCE'));
      return false;
    }
    session.ending = true;
    session.flushTimer = env.setTimeout(() => {
      fail(session, audioError('L’enregistrement n’a pas pu se terminer. Relance la conversation.', 'VOICE_CAPTURE'));
    }, 2_000);
    try {
      session.recorder.stop();
      releaseInput(session);
    } catch (error) {
      fail(session, error);
    }
    return true;
  }

  function monitor(session) {
    if (current !== session || session.ending) return;
    const now = env.now();
    const elapsed = Math.min(100, Math.max(0, now - session.lastSample));
    session.lastSample = now;
    let sum = 0;
    if (session.analyser.getFloatTimeDomainData) {
      session.analyser.getFloatTimeDomainData(session.samples);
      for (const value of session.samples) sum += value * value;
    } else {
      session.analyser.getByteTimeDomainData(session.byteSamples);
      for (const value of session.byteSamples) sum += ((value - 128) / 128) ** 2;
    }
    const energy = Math.sqrt(sum / session.samples.length);
    onEnergy?.(energy);
    if (energy >= VOICE_THRESHOLD) {
      session.voicedMs += elapsed;
      session.lastVoice = now;
    } else if (session.voicedMs >= MIN_VOICE_MS && now - session.lastVoice >= END_SILENCE_MS) {
      finish();
    }
  }

  async function start() {
    if (current) return false;
    if (!supported) {
      onError?.(audioError('La conversation au micro n’est pas disponible dans ce navigateur. Ouvre le Salon dans Chrome ou Safari.', 'VOICE_UNSUPPORTED'));
      return false;
    }
    const session = {chunks: [], bytes: 0, voicedMs: 0, trackListeners: [], ending: false, cancelled: false};
    current = session;
    onStatus?.('Ouverture du micro…');
    try {
      // These two calls happen before the first await, preserving the user gesture.
      session.ownsContext = !audioContext;
      session.context = audioContext || new env.AudioContext();
      const resume = Promise.resolve(session.context.state === 'running' ? undefined : session.context.resume?.()).then(() => null, error => error);
      const acquire=inputLease?inputLease.acquire:env.getUserMedia;
      const stream = await acquire({audio: {
        echoCancellation: true, noiseSuppression: true, channelCount: 1,
      }});
      if (current !== session) { if(inputLease)inputLease.mute(stream);else stopTracks(stream); return false; }
      session.stream = stream;
      const resumeError = await resume;
      if (current !== session) return false;
      if (resumeError || (session.context.state && session.context.state !== 'running')) {
        throw audioError('Le micro est suspendu par le téléphone. Touche à nouveau le bouton pour relancer la conversation.', 'VOICE_SUSPENDED');
      }
      session.source = session.context.createMediaStreamSource(stream);
      session.analyser = session.context.createAnalyser();
      session.analyser.fftSize = 1024;
      session.source.connect(session.analyser);
      session.samples = new Float32Array(session.analyser.fftSize);
      session.byteSamples = new Uint8Array(session.analyser.fftSize);
      session.mimeType = recorderType(env.MediaRecorder);
      session.recorder = new env.MediaRecorder(stream, session.mimeType ? {mimeType: session.mimeType} : undefined);
      session.recorder.ondataavailable = event => {
        if (current !== session || !event.data?.size) return;
        if (session.bytes + event.data.size > MAX_CAPTURE_BYTES) {
          fail(session, audioError('L’enregistrement est trop volumineux. Relance le micro avec une phrase plus courte.', 'VOICE_TOO_LARGE'));
          return;
        }
        session.bytes += event.data.size;
        session.chunks.push(event.data);
      };
      session.recorder.onstop = () => complete(session);
      session.recorder.onerror = event => fail(session, event.error);
      for (const track of stream.getTracks()) {
        const ended = () => fail(session, audioError('Le téléphone a coupé le micro. Relance la conversation.', 'VOICE_INTERRUPTED'));
        track.addEventListener?.('ended', ended);
        session.trackListeners.push([track, ended]);
      }
      session.lastSample = env.now();
      session.recorder.start(250);
      session.monitor = env.setInterval(() => {
        try { monitor(session); } catch (error) { fail(session, error); }
      }, SAMPLE_INTERVAL_MS);
      session.initialTimer = env.setTimeout(() => {
        if (session.voicedMs < MIN_VOICE_MS) {
          fail(session, audioError('Je n’ai pas entendu de phrase pendant quinze secondes. La conversation est en pause ; relance le micro pour parler.', 'VOICE_SILENCE'));
        }
      }, INITIAL_SILENCE_MS);
      session.maxTimer = env.setTimeout(() => { if (current === session) finish(); }, MAX_CAPTURE_MS);
      onStatus?.('Je t’écoute.');
      return true;
    } catch (error) {
      fail(session, error);
      return false;
    }
  }

  function stop() {
    if (!current) return;
    const session = current;
    current = null;
    session.cancelled = true;
    clean(session);
  }

  return {start, finish, stop, supported, get active() { return Boolean(current); }};
}

function decodeAudio(context, bytes) {
  return new Promise((resolve, reject) => {
    // Callback support keeps older mobile Web Audio implementations usable.
    const result = context.decodeAudioData(bytes, resolve, reject);
    if (result?.then) result.then(resolve, reject);
  });
}

/** Decoded audio is the clock for both completion and avatar lip movement. */
export function createRemoteSpeech({onEnergy, onStatus, dependencies} = {}) {
  const env = runtime(dependencies);
  let context = null, resumePromise = Promise.resolve(), current = null, disposed = false;

  function settle(job, error) {
    if (job.settled) return;
    job.settled = true;
    if (current === job) current = null;
    env.clearInterval(job.monitor);
    env.clearTimeout(job.endTimer);
    job.signal?.removeEventListener('abort', job.abort);
    if (job.source) {
      job.source.onended = null;
      if (error) { try { job.source.stop(); } catch {} }
      try { job.source.disconnect(); } catch {}
    }
    job.buffer = null;
    job.channels = null;
    onEnergy?.(0);
    if (error) job.reject(error); else job.resolve();
  }

  function stateChanged() {
    if (current?.playing && context?.state && context.state !== 'running') {
      settle(current, audioError('Le téléphone a suspendu le son. Relance la conversation pour reprendre.', 'VOICE_PLAYBACK_SUSPENDED'));
    }
  }

  // Intentionally not async: create/resume must run inside the tap handler.
  function unlock() {
    if (disposed || !env.AudioContext) return false;
    try {
      if (!context) {
        context = new env.AudioContext();
        context.addEventListener?.('statechange', stateChanged);
      }
      if (context.state !== 'running') {
        resumePromise = Promise.resolve(context.resume()).then(() => null, error => error);
      } else resumePromise = Promise.resolve(null);
      return true;
    } catch { return false; }
  }

  function position() {
    const job = current;
    if (!job?.playing || job.settled || !job.buffer || !context) return null;
    const elapsed = Math.max(0, context.currentTime - job.startedAt);
    const fraction = Math.min(1, elapsed / job.buffer.duration);
    const from = Math.min(job.buffer.length, Math.floor(elapsed * job.buffer.sampleRate));
    const to = Math.min(job.buffer.length, from + Math.max(1, Math.round(job.buffer.sampleRate * 0.02)));
    let sum = 0;
    for (const samples of job.channels) {
      for (let i = from; i < to; i++) sum += samples[i] ** 2;
    }
    const count = (to - from) * job.channels.length;
    return {fraction, energy: count ? Math.sqrt(sum / count) : 0};
  }

  function stop() { if (current) settle(current, abortError()); }

  function play(blob, {signal} = {}) {
    stop();
    return new Promise((resolve, reject) => {
      const job = {resolve, reject, signal, settled: false, playing: false};
      current = job;
      job.abort = () => settle(job, abortError());
      if (signal?.aborted) { job.abort(); return; }
      signal?.addEventListener('abort', job.abort, {once: true});
      async function prepare() {
        if (disposed || !unlock()) throw audioError('Le son n’est pas disponible dans ce navigateur.', 'VOICE_PLAYBACK_UNAVAILABLE');
        if (!blob?.arrayBuffer || !blob.size || blob.size > MAX_SPEECH_BYTES) {
          throw audioError('La réponse audio est vide ou trop volumineuse.', 'VOICE_PLAYBACK_SIZE');
        }
        onStatus?.('Préparation de la voix…');
        const resumeError = await resumePromise;
        if (job.settled) return;
        if (resumeError || (context.state && context.state !== 'running')) {
          throw audioError('Le son est bloqué. Touche le bouton pour relancer la conversation.', 'VOICE_PLAYBACK_SUSPENDED');
        }
        const bytes = await blob.arrayBuffer();
        if (job.settled) return;
        if (!bytes.byteLength || bytes.byteLength > MAX_SPEECH_BYTES) {
          throw audioError('La réponse audio est vide ou trop volumineuse.', 'VOICE_PLAYBACK_SIZE');
        }
        const buffer = await decodeAudio(context, bytes);
        if (job.settled) return;
        if (!Number.isFinite(buffer?.duration) || buffer.duration <= 0 || !buffer.numberOfChannels) {
          throw audioError('La réponse audio ne peut pas être lue.', 'VOICE_PLAYBACK_DECODE');
        }
        job.buffer = buffer;
        job.channels = Array.from({length: buffer.numberOfChannels}, (_, index) => buffer.getChannelData(index));
        job.source = context.createBufferSource();
        job.source.buffer = buffer;
        job.source.connect(context.destination);
        job.source.onended = () => settle(job);
        job.startedAt = context.currentTime;
        job.playing = true;
        job.source.start(job.startedAt);
        if (job.settled) return;
        job.monitor = env.setInterval(() => {
          if (current === job) onEnergy?.(position()?.energy || 0);
        }, 20);
        job.endTimer = env.setTimeout(() => {
          settle(job, audioError('La lecture audio a été interrompue. Relance la conversation.', 'VOICE_PLAYBACK_INTERRUPTED'));
        }, buffer.duration * 1000 + 5_000);
        onStatus?.('Le personnage te répond.');
      }
      prepare().catch(error => {
        settle(job, error?.code?.startsWith?.('VOICE_') ? error : audioError('La réponse audio ne peut pas être lue. Relance la conversation.', 'VOICE_PLAYBACK_DECODE'));
      });
    });
  }

  function dispose() {
    disposed = true;
    stop();
    context?.removeEventListener?.('statechange', stateChanged);
    closeContext(context);
    context = null;
  }

  return {unlock, play, stop, dispose, position, get context() { return context; }};
}
