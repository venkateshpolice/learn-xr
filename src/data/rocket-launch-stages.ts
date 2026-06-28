export interface RocketLaunchStage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  funFact: string;
  camera: [number, number, number];
  lookAt: [number, number, number];
  altitude: number;
  speed: number;
  phase: "pad" | "countdown" | "ignition" | "liftoff" | "gravity-turn" | "maxq" | "stage-sep" | "fairing-sep" | "orbit" | "deploy";
  showExhaust: boolean;
  exhaustIntensity: number;
  rocketY: number;
  showFairing: boolean;
  showBooster: boolean;
  showSatellite: boolean;
  showTrajectory: boolean;
}

/** World Y of rocket group origin — engines sit on pad when rocketY = 0 */
export const ROCKET_GROUP_BASE = 3.5;

export function rocketGroupY(rocketY: number): number {
  return rocketY + ROCKET_GROUP_BASE;
}

/** Visual center of rocket stack for camera framing */
export function rocketFocalPoint(
  stage: Pick<RocketLaunchStage, "rocketY" | "showBooster" | "showFairing" | "phase">,
): [number, number, number] {
  if (stage.phase === "deploy") {
    const gy = rocketGroupY(stage.rocketY);
    return [0, gy + 1.6, 0];
  }
  const gy = rocketGroupY(stage.rocketY);
  let focalYOffset = 0;
  if (stage.showBooster && stage.showFairing) focalYOffset = 2;
  else if (stage.showBooster) focalYOffset = 0;
  else if (stage.showFairing) focalYOffset = 1.2;
  else focalYOffset = 0.4;
  return [0, gy + focalYOffset, 0];
}

function buildStage(
  s: Omit<RocketLaunchStage, "camera" | "lookAt"> & {
    camOffset: [number, number, number];
  },
): RocketLaunchStage {
  const lookAt = rocketFocalPoint(s);
  return {
    ...s,
    lookAt,
    camera: [
      lookAt[0] + s.camOffset[0],
      lookAt[1] + s.camOffset[1],
      lookAt[2] + s.camOffset[2],
    ],
  };
}

export const ROCKET_LAUNCH_STAGES: RocketLaunchStage[] = [
  buildStage({
    id: "pad",
    title: "On the Launch Pad",
    subtitle: "Ready for liftoff",
    description:
      "The rocket sits on the launch pad, fueled and ready. Engineers run final systems checks on avionics, propulsion, and payload integrity. The countdown sequence begins.",
    funFact:
      "A fully fueled rocket like Falcon 9 weighs about 549,000 kg — 96% of that is fuel!",
    camOffset: [10, 0, 18],
    altitude: 0,
    speed: 0,
    phase: "pad",
    showExhaust: false,
    exhaustIntensity: 0,
    rocketY: 0,
    showFairing: true,
    showBooster: true,
    showSatellite: false,
    showTrajectory: false,
  }),
  buildStage({
    id: "countdown",
    title: "T-10 Countdown",
    subtitle: "Engines arming",
    description:
      "At T-10 seconds, the flight computer takes control. Fuel valves open, turbo-pumps spin up, and the onboard guidance system verifies trajectory. The launch clamps hold the rocket until full thrust is confirmed.",
    funFact:
      "SpaceX rockets run on liquid oxygen (LOX) and rocket-grade kerosene (RP-1).",
    camOffset: [7, -1, 16],
    altitude: 0,
    speed: 0,
    phase: "countdown",
    showExhaust: false,
    exhaustIntensity: 0,
    rocketY: 0,
    showFairing: true,
    showBooster: true,
    showSatellite: false,
    showTrajectory: false,
  }),
  buildStage({
    id: "ignition",
    title: "Engine Ignition",
    subtitle: "T-0 — Main engines start",
    description:
      "At T-0, all engines ignite simultaneously. Turbo-pumps force thousands of liters of fuel and oxidizer per second into the combustion chambers. Temperatures reach 3,300°C, creating massive thrust — watch the flame trench glow as exhaust blasts downward!",
    funFact:
      "A single Merlin engine produces 845 kN of thrust — enough to lift 40 cars!",
    camOffset: [6, -5, 14],
    altitude: 0,
    speed: 0,
    phase: "ignition",
    showExhaust: true,
    exhaustIntensity: 0.95,
    rocketY: 1.2,
    showFairing: true,
    showBooster: true,
    showSatellite: false,
    showTrajectory: false,
  }),
  buildStage({
    id: "liftoff",
    title: "Liftoff!",
    subtitle: "Thrust > Weight — Newton's 3rd Law",
    description:
      "When thrust exceeds the rocket's weight, it lifts off! The rocket accelerates upward through the atmosphere, burning through hundreds of kg of fuel per second. Newton's Third Law: every action has an equal and opposite reaction.",
    funFact:
      "In the first 10 seconds, the rocket travels only about 100 meters — then it accelerates rapidly!",
    camOffset: [8, 1, 18],
    altitude: 5000,
    speed: 340,
    phase: "liftoff",
    showExhaust: true,
    exhaustIntensity: 1.0,
    rocketY: 5,
    showFairing: true,
    showBooster: true,
    showSatellite: false,
    showTrajectory: true,
  }),
  buildStage({
    id: "gravity-turn",
    title: "Gravity Turn",
    subtitle: "Projectile motion — pitch-over maneuver",
    description:
      "After clearing the launch tower, the rocket tilts slightly from vertical. Gravity pulls it sideways while thrust pushes it forward — creating a curved projectile-motion trajectory. This 'gravity turn' is the most fuel-efficient path to orbit, combining vertical climb and horizontal acceleration into one smooth arc.",
    funFact:
      "A gravity turn follows the exact same parabolic math as a ball thrown at an angle — v·t + ½gt² — just at 2,000 m/s instead of 20 m/s!",
    camOffset: [11, 0, 16],
    altitude: 8000,
    speed: 800,
    phase: "gravity-turn",
    showExhaust: true,
    exhaustIntensity: 1.0,
    rocketY: 7,
    showFairing: true,
    showBooster: true,
    showSatellite: false,
    showTrajectory: true,
  }),
  buildStage({
    id: "maxq",
    title: "Max-Q",
    subtitle: "Maximum aerodynamic pressure",
    description:
      "About 80 seconds in, the rocket reaches Max-Q — the point of maximum aerodynamic stress. The atmosphere pushes hardest against the vehicle. Engines may throttle down briefly to reduce structural loads.",
    funFact:
      "At Max-Q the pressure on the rocket is about 35 kPa — like standing in a hurricane!",
    camOffset: [7, 0, 17],
    altitude: 12000,
    speed: 1200,
    phase: "maxq",
    showExhaust: true,
    exhaustIntensity: 0.75,
    rocketY: 9,
    showFairing: true,
    showBooster: true,
    showSatellite: false,
    showTrajectory: true,
  }),
  buildStage({
    id: "stage-sep",
    title: "Stage Separation",
    subtitle: "Booster detaches at 70 km",
    description:
      "The first stage burns out and explosive bolts fire, separating it from the second stage. Cold-gas thrusters push the stages apart. The second stage engine ignites in the vacuum of space.",
    funFact:
      "SpaceX lands and reuses first-stage boosters — saving $40 million per launch!",
    camOffset: [6, 1, 12],
    altitude: 70000,
    speed: 6500,
    phase: "stage-sep",
    showExhaust: true,
    exhaustIntensity: 0.85,
    rocketY: 14,
    showFairing: true,
    showBooster: false,
    showSatellite: false,
    showTrajectory: true,
  }),
  buildStage({
    id: "fairing-sep",
    title: "Fairing Separation",
    subtitle: "Payload exposed at 110 km",
    description:
      "Above the atmosphere, the protective nose cone (fairing) splits in half and falls away, exposing the satellite payload. The fairing is no longer needed since there's no air resistance in space.",
    funFact:
      "Each fairing half costs about $3 million — SpaceX catches them with boats and reuses them!",
    camOffset: [5, 1, 11],
    altitude: 110000,
    speed: 15000,
    phase: "fairing-sep",
    showExhaust: true,
    exhaustIntensity: 0.55,
    rocketY: 18,
    showFairing: false,
    showBooster: false,
    showSatellite: true,
    showTrajectory: true,
  }),
  buildStage({
    id: "orbit",
    title: "Orbit Insertion",
    subtitle: "Circularization burn at 400 km",
    description:
      "The second stage performs a circularization burn, adjusting velocity to exactly 7.66 km/s. At this speed, the centrifugal force from orbital motion perfectly balances Earth's gravity — the satellite is now in stable orbit!",
    funFact:
      "The ISS orbits at 408 km altitude, traveling 27,600 km/h — it circles Earth every 90 minutes!",
    camOffset: [6, 1, 11],
    altitude: 400000,
    speed: 27600,
    phase: "orbit",
    showExhaust: false,
    exhaustIntensity: 0,
    rocketY: 22,
    showFairing: false,
    showBooster: false,
    showSatellite: true,
    showTrajectory: true,
  }),
  buildStage({
    id: "deploy",
    title: "Satellite Deployed!",
    subtitle: "Mission complete",
    description:
      "Spring mechanisms push the satellite away from the second stage. Solar panels unfold, antennas deploy, and the satellite begins its mission — communication, weather monitoring, GPS, or scientific research.",
    funFact:
      "There are over 10,000 active satellites orbiting Earth right now!",
    camOffset: [4, 0.5, 6],
    altitude: 400000,
    speed: 27600,
    phase: "deploy",
    showExhaust: false,
    exhaustIntensity: 0,
    rocketY: 23,
    showFairing: false,
    showBooster: false,
    showSatellite: true,
    showTrajectory: false,
  }),
];
