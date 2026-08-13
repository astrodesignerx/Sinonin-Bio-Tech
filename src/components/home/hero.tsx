import { HERO_VERSION } from "@/lib/config";
import HeroV1 from "./hero-v1";
import HeroV2 from "./hero-v2";

/*
  Switch point for hero variants. Each version lives in its own file so one can
  be reworked without putting the shipped one at risk, and so the two can be
  compared by changing a single constant rather than by reverting edits.

  V1  split layout, copy left, media right with a right-edge bleed
  V2  full-bleed animated cells, type over them, media as a floating card
*/
export default function Hero() {
  switch (HERO_VERSION) {
    case "v2":
      return <HeroV2 />;
    case "v1":
    default:
      return <HeroV1 />;
  }
}
