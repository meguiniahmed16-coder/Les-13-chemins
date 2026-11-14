// A full ovation is reserved for the completed five-sequence challenge.
export const OVATION_SECONDS=8;
export function finaleTime(run){return run.phase==='won'?run.time:null;}
export function finaleFinished(run){return run.phase==='won'&&run.time>=OVATION_SECONDS;}
