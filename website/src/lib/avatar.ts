import { Avatar, Style } from "@dicebear/core";
import botttsNeutralDefinition from "@dicebear/styles/bottts-neutral.json" with { type: "json" };

const botttsNeutralStyle = new Style(botttsNeutralDefinition);

export function createBotttsNeutralAvatar(seed: string | undefined, size = 128) {
  return new Avatar(botttsNeutralStyle, {
    seed: seed ?? "default-avatar",
    size
  });
}
