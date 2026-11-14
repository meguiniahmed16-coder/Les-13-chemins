// Gentle pacing for this first-person prototype. The original yo-yo keeps
// the core's historical defaults because it does not opt into these values.
export const PRISON_BALANCE=Object.freeze({
 firstGuardDelay:28,
 stageGuardDelay:28,
 guardRest:32,
 guardWarning:4,
 guardWatching:2.5,
 guardLeaving:1.5,
 guardExposure:2,
 pullSpeed:.5,
 // Physical metres: the rope sways inside its opening at every screen ratio.
 ropeAmplitudeMeters:.024,
 ropeSpeedScale:.58
});
