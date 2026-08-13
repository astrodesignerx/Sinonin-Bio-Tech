import { HERO_VERSION } from "@/lib/config";
import HeroV1 from "./hero-v1";

/*
  Switch point for hero variants. Each version lives in its own file so one can
  be reworked without putting the shipped one at risk, and so the two can be
  compared by changing a single constant rather than by reverting edits.

  V1  split layout, copy left, media right with a right-edge bleed
*/
export default function Hero() {
  switch (HERO_VERSION) {
    case "v1":
    default:
      return <HeroV1 />;
  }
}
