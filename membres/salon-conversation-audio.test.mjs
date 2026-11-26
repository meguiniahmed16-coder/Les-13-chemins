import assert from 'node:assert/strict';
import test from 'node:test';
import {createVoiceCapture, createRemoteSpeech, createCallInputLease} from './salon-conversation-audio.js';

const tick = () => new Promise(resolve => setImmediate(resolve));

function clock() {
  let time = 0, next = 1;
  const tasks = new Map();
  const schedule = (fn, delay, repeat) => {
    const id = next++;
    tasks.set(id, {fn, at: time + delay, repeat});
    return id;
  };
  return {
    now: () => time,
    setTimeout: (fn, ms) => schedule(fn, ms, 0),
    clearTimeout: id => tasks.delete(id),
    setInterval: (fn, ms) => schedule(fn, ms, ms),
    clearInterval: id => tasks.delete(id),
    get count() { return tasks.size; },
    advance(ms) {
      const end = time + ms;
      for (;;) {
        const due = [...tasks].filter(([, item]) => item.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        const [id, task] = due;
        time = task.at;
        if (!task.repeat) tasks.delete(id);
        task.fn();
        if (task.repeat && tasks.has(id)) task.at += task.repeat;
      }
      time = end;
    },
  };
}

function captureFixture(t, options = {}) {
  const timers = clock(), clips = [], errors = [], statuses = [], energies = [];
  const recorders = [], contexts = [], listeners = new Set();
  let energy = 0, stopped = 0, constraints;
  const track = {
    stop() { stopped++; },
    addEventListener(type, listener) { listeners.add(listener); },
    removeEventListener(type, listener) { listeners.delete(listener); },
  };
  const stream = {getTracks: () => [track]};
  class Context {
    constructor() { this.state = 'running'; contexts.push(this); }
    resume() { return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
    createMediaStreamSource() { return {connect() {}, disconnect() {}}; }
    createAnalyser() { return {fftSize: 1024, disconnect() {}, getFloatTimeDomainData(data) { data.fill(energy); }}; }
  }
  class Recorder {
    static isTypeSupported(type) { return type === (options.mime || 'audio/webm;codecs=opus'); }
    constructor(input, config) {
      assert.equal(input, stream);
      this.mimeType = config?.mimeType || 'audio/webm';
      this.state = 'inactive';
      this.stops = 0;
      recorders.push(this);
    }
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      this.stops++;
      const data = this.ondataavailable, end = this.onstop;
      if (!options.manualFlush) queueMicrotask(() => {
        data?.({data: new Blob(['recorded speech'], {type: this.mimeType})});
        end?.();
      });
    }
  }
  const capture = createVoiceCapture({
    onClip: value => clips.push(value), onError: value => errors.push(value),
    onStatus: value => statuses.push(value), onEnergy: value => energies.push(value),
    audioContext: options.audioContext,
    dependencies: {
      ...timers, AudioContext: Context, MediaRecorder: Recorder,
      getUserMedia: async value => { constraints = value; return options.getUserMedia ? options.getUserMedia() : stream; },
    },
  });
  t.after(() => capture.stop());
  return {capture, timers, clips, errors, statuses, energies, recorders, contexts, stream, listeners,
    set energy(value) { energy = value; }, get stopped() { return stopped; }, get constraints() { return constraints; }};
}

test('Le micro utilise mono, réduction du bruit et annulation d’écho ; la fin du silence produit un seul clip', async t => {
  const f = captureFixture(t);
  assert.equal(await f.capture.start(), true);
  assert.equal(f.capture.active, true);
  assert.deepEqual(f.constraints, {audio: {echoCancellation: true, noiseSuppression: true, channelCount: 1}});
  f.energy = .05; f.timers.advance(320);
  f.energy = 0; f.timers.advance(1160);
  assert.equal(f.clips.length, 0);
  f.timers.advance(40); await tick();
  assert.equal(f.clips.length, 1);
  assert.equal(f.clips[0].type, 'audio/webm;codecs=opus');
  assert.equal(f.capture.active, false);
  assert.equal(f.stopped, 1);
  assert.equal(f.errors.length, 0);
  assert.equal(f.timers.count, 0);
  assert.equal(f.contexts[0].state, 'closed');
});

test('Le silence initial met la conversation en pause sans envoyer un enregistrement', async t => {
  const f = captureFixture(t);
  await f.capture.start();
  f.timers.advance(15_000); await tick();
  assert.equal(f.capture.active, false);
  assert.equal(f.clips.length, 0);
  assert.equal(f.errors.length, 1);
  assert.equal(f.errors[0].code, 'VOICE_SILENCE');
  assert.match(f.errors[0].message, /en pause/);
  f.timers.advance(60_000); await tick();
  assert.equal(f.recorders.length, 1);
  assert.equal(f.errors.length, 1);
});

test('Annuler pendant la permission coupe une piste accordée tardivement et ne signale pas une fausse erreur', async t => {
  let grant;
  const f = captureFixture(t, {getUserMedia: () => new Promise(resolve => { grant = resolve; })});
  const starting = f.capture.start();
  assert.equal(f.capture.active, true);
  f.capture.stop();
  grant(f.stream);
  assert.equal(await starting, false);
  assert.equal(f.stopped, 1);
  assert.equal(f.recorders.length, 0);
  assert.equal(f.errors.length, 0);
  assert.equal(f.clips.length, 0);
});

test('Un refus de permission produit une erreur lisible, une seule fois', async t => {
  const f = captureFixture(t, {getUserMedia: () => { throw Object.assign(new Error(), {name: 'NotAllowedError'}); }});
  assert.equal(await f.capture.start(), false);
  assert.equal(f.errors.length, 1);
  assert.equal(f.errors[0].code, 'VOICE_PERMISSION');
  assert.match(f.errors[0].message, /Autorise le micro/);
  assert.equal(f.capture.active, false);
  assert.equal(f.contexts[0].state, 'closed');
});

test('Terminer manuellement exige une durée minimale de parole', async t => {
  const f = captureFixture(t);
  await f.capture.start();
  f.energy = .1; f.timers.advance(80);
  assert.equal(f.capture.finish(), false);
  await tick();
  assert.equal(f.clips.length, 0);
  assert.equal(f.errors[0].code, 'VOICE_SILENCE');
});

test('Une phrase longue se termine à quarante-cinq secondes et conserve le format MP4 mobile', async t => {
  const f = captureFixture(t, {mime: 'audio/mp4'});
  await f.capture.start();
  f.energy = .03;
  f.timers.advance(45_000); await tick();
  assert.equal(f.clips.length, 1);
  assert.equal(f.clips[0].type, 'audio/mp4');
  assert.equal(f.errors.length, 0);
  assert.equal(f.capture.active, false);
});

test('Le plafond de deux Mio arrête le micro sans transmettre un clip tronqué', async t => {
  const f = captureFixture(t);
  await f.capture.start();
  f.recorders[0].ondataavailable({data: {size: 2 * 1024 * 1024 + 1}});
  await tick();
  assert.equal(f.errors[0].code, 'VOICE_TOO_LARGE');
  assert.equal(f.errors.length, 1);
  assert.equal(f.stopped, 1);
  assert.equal(f.clips.length, 0);
});

test('Une annulation pendant la finalisation ignore les derniers événements du précédent micro', async t => {
  const f = captureFixture(t, {manualFlush: true});
  await f.capture.start();
  f.energy = .05; f.timers.advance(320);
  const oldData = f.recorders[0].ondataavailable, oldEnd = f.recorders[0].onstop;
  f.capture.finish(); f.capture.stop();
  oldData({data: new Blob(['late'], {type: 'audio/webm'})}); oldEnd();
  assert.equal(f.clips.length, 0);
  assert.equal(f.errors.length, 0);
  assert.equal(f.timers.count, 0);
  assert.equal(f.stopped, 1);
});

test('Une coupure du micro par le téléphone termine la capture et met la boucle en pause', async t => {
  const f = captureFixture(t);
  await f.capture.start();
  [...f.listeners][0](); await tick();
  assert.equal(f.errors[0].code, 'VOICE_INTERRUPTED');
  assert.equal(f.capture.active, false);
  assert.equal(f.clips.length, 0);
  assert.equal(f.listeners.size, 0);
});

test('La capture réutilise le contexte déverrouillé et le garde ouvert pour les tours suivants', async t => {
  let closes = 0, resumes = 0, disconnects = 0;
  const shared = {
    state: 'running',
    resume() { resumes++; return Promise.resolve(); },
    close() { closes++; this.state = 'closed'; return Promise.resolve(); },
    createMediaStreamSource() { return {connect() {}, disconnect() { disconnects++; }}; },
    createAnalyser() { return {fftSize: 1024, disconnect() {}, getFloatTimeDomainData(data) { data.fill(.05); }}; },
  };
  const f = captureFixture(t, {audioContext: shared});
  await f.capture.start();
  f.timers.advance(320); f.capture.finish(); await tick();
  assert.equal(f.clips.length, 1);
  assert.equal(shared.state, 'running');
  assert.equal(closes, 0);
  assert.equal(resumes, 0, 'Un contexte déjà déverrouillé ne dépend pas d’un nouveau geste.');
  assert.equal(f.contexts.length, 0);
  assert.equal(disconnects, 1);
  await f.capture.start(); f.capture.stop(); await tick();
  assert.equal(closes, 0);
  assert.equal(shared.state, 'running');
  assert.equal(f.stopped, 2);
});

test('Un contexte partagé encore suspendu coupe le micro avec une erreur sans fermer ce contexte', async t => {
  let resumes = 0, closes = 0;
  const shared = {state: 'suspended', resume() { resumes++; return Promise.resolve(); }, close() { closes++; }};
  const f = captureFixture(t, {audioContext: shared});
  assert.equal(await f.capture.start(), false);
  assert.equal(f.errors[0].code, 'VOICE_SUSPENDED');
  assert.equal(resumes, 1);
  assert.equal(closes, 0);
  assert.equal(f.stopped, 1);
  assert.equal(f.capture.active, false);
});

function speechFixture(t, options = {}) {
  const timers = clock(), contexts = [], sources = [], energies = [];
  const samples = new Float32Array(1_000).fill(.2);
  const buffer = {duration: 1, sampleRate: 1_000, length: 1_000, numberOfChannels: 1, getChannelData: () => samples};
  class Context {
    constructor() {
      this.state = 'suspended'; this.currentTime = 0; this.destination = {}; this.resumes = 0;
      this.listeners = new Map(); contexts.push(this);
    }
    resume() { this.resumes++; this.state = 'running'; return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
    addEventListener(type, listener) { this.listeners.set(type, listener); }
    removeEventListener(type) { this.listeners.delete(type); }
    decodeAudioData() { return options.decode ? options.decode(buffer) : Promise.resolve(buffer); }
    createBufferSource() {
      const node = {starts: 0, stops: 0, disconnected: false,
        connect() {}, disconnect() { this.disconnected = true; },
        start() { this.starts++; }, stop() { this.stops++; },
      };
      sources.push(node); return node;
    }
  }
  const speech = createRemoteSpeech({onEnergy: value => energies.push(value), dependencies: {...timers, AudioContext: Context}});
  t.after(() => speech.dispose());
  return {speech, timers, contexts, sources, energies, samples, buffer};
}

const voiceBlob = () => new Blob(['audio fixture'], {type: 'audio/mpeg'});

test('unlock crée et reprend le contexte immédiatement dans le geste utilisateur', t => {
  const f = speechFixture(t);
  assert.equal(f.speech.unlock(), true);
  assert.equal(f.contexts.length, 1);
  assert.equal(f.contexts[0].resumes, 1);
  assert.equal(f.speech.context, f.contexts[0]);
  assert.equal(f.speech.position(), null);
});

test('La lecture se termine avec onended et fournit la position et le RMS des vrais échantillons', async t => {
  const f = speechFixture(t);
  f.speech.unlock();
  let ended = false;
  const playback = f.speech.play(voiceBlob()).then(() => { ended = true; });
  await tick();
  f.contexts[0].currentTime = .5;
  const position = f.speech.position();
  assert.equal(position.fraction, .5);
  assert.ok(Math.abs(position.energy - .2) < 1e-6);
  f.samples.fill(0, 500, 520);
  assert.equal(f.speech.position().energy, 0);
  f.timers.advance(1_000); await tick();
  assert.equal(ended, false, 'Un délai estimé ne remplace pas la fin du son.');
  f.sources[0].onended(); await playback;
  assert.equal(ended, true);
  assert.equal(f.speech.position(), null);
  assert.equal(f.sources[0].disconnected, true);
  assert.equal(f.timers.count, 0);
});

test('Arrêter une lecture active rejette AbortError et débranche la source', async t => {
  const f = speechFixture(t);
  const playback = f.speech.play(voiceBlob());
  const rejected = assert.rejects(playback, {name: 'AbortError'});
  await tick();
  const oldEnd = f.sources[0].onended;
  f.speech.stop(); await rejected;
  oldEnd();
  assert.equal(f.sources[0].stops, 1);
  assert.equal(f.sources[0].disconnected, true);
  assert.equal(f.speech.position(), null);
  assert.equal(f.timers.count, 0);
});

test('Une annulation pendant le décodage interdit tout démarrage audio tardif', async t => {
  let decoded;
  const f = speechFixture(t, {decode: buffer => new Promise(resolve => { decoded = () => resolve(buffer); })});
  const controller = new AbortController();
  const playback = f.speech.play(voiceBlob(), {signal: controller.signal});
  const rejected = assert.rejects(playback, {name: 'AbortError'});
  await tick(); controller.abort(); await rejected;
  decoded(); await tick();
  assert.equal(f.sources.length, 0);
  assert.equal(f.speech.position(), null);
});

test('Un signal déjà annulé ne crée aucun contexte ni lecture', async t => {
  const f = speechFixture(t);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(f.speech.play(voiceBlob(), {signal: controller.signal}), {name: 'AbortError'});
  assert.equal(f.contexts.length, 0);
});

test('Un fichier au-delà de quatre Mio est refusé avant décodage', async t => {
  const f = speechFixture(t);
  let read = false;
  await assert.rejects(f.speech.play({size: 4 * 1024 * 1024 + 1, arrayBuffer() { read = true; }}), {code: 'VOICE_PLAYBACK_SIZE'});
  assert.equal(read, false);
  assert.equal(f.sources.length, 0);
});

test('La suspension audio du téléphone rejette la lecture au lieu de bloquer la boucle', async t => {
  const f = speechFixture(t);
  const playback = f.speech.play(voiceBlob());
  const rejected = assert.rejects(playback, {code: 'VOICE_PLAYBACK_SUSPENDED'});
  await tick();
  f.contexts[0].state = 'suspended';
  f.contexts[0].listeners.get('statechange')();
  await rejected;
  assert.equal(f.speech.position(), null);
  assert.equal(f.sources[0].stops, 1);
});

test('Un décodage illisible donne une erreur explicite sans synthèse de secours cachée', async t => {
  const f = speechFixture(t, {decode: () => Promise.reject(new Error('invalid mp3'))});
  await assert.rejects(f.speech.play(voiceBlob()), {code: 'VOICE_PLAYBACK_DECODE'});
  assert.equal(f.sources.length, 0);
  assert.equal(f.timers.count, 0);
});


test('Un appel garde un seul accès microphone et le coupe hors parole puis au raccrochage',async()=>{
 let opened=0,stopped=0;const track={enabled:true,stop(){stopped++;}},stream={getTracks:()=>[track]};const lease=createCallInputLease(async()=>{opened++;return stream;});
 assert.equal(await lease.acquire({audio:true}),stream);lease.mute();assert.equal(track.enabled,false);assert.equal(stopped,0);assert.equal(await lease.acquire({audio:true}),stream);assert.equal(track.enabled,true);assert.equal(opened,1);lease.close();assert.equal(stopped,1);await assert.rejects(()=>lease.acquire({audio:true}));
});


test('WAV Cartesia : les fragments PCM sont décodés avant la fin du téléchargement',async()=>{
 const {createWavStreamDecoder}=await import('./salon-conversation-audio.js');
 const pcm=new Int16Array([0,16384,-16384,32767]);const bytes=new Uint8Array(44+pcm.byteLength),v=new DataView(bytes.buffer);
 for(const [at,tag] of [[0,'RIFF'],[8,'WAVE'],[12,'fmt '],[36,'data']])bytes.set(new TextEncoder().encode(tag),at);
 v.setUint32(4,bytes.length-8,true);v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,24000,true);v.setUint32(28,48000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);v.setUint32(40,pcm.byteLength,true);pcm.forEach((x,i)=>v.setInt16(44+i*2,x,true));
 const d=createWavStreamDecoder();assert.equal(d.push(bytes.slice(0,17)),null);assert.equal(d.push(bytes.slice(17,45)),null);
 const first=d.push(bytes.slice(45,48));assert.deepEqual([...first.samples],[0,.5]);assert.equal(first.rate,24000);
 const last=d.push(bytes.slice(48),true);assert.equal(last.samples[0],-.5);assert.equal(last.samples.length,2);
});
