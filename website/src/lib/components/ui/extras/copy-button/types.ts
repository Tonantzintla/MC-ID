/*
	Installed from @ieedan/shadcn-svelte-extras
*/

import type { Snippet } from "svelte";
import type { ButtonPropsWithoutHTML } from "$components/ui/extras/button";
import type { UseClipboard } from "$lib/hooks/extras/use-clipboard.svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { WithChildren, WithoutChildren } from "bits-ui";

export type CopyButtonPropsWithoutHTML = WithChildren<
  Pick<ButtonPropsWithoutHTML, "size" | "variant"> & {
    ref?: HTMLButtonElement | null;
    text: string;
    icon?: Snippet<[]>;
    animationDuration?: number;
    onCopy?: (status: UseClipboard["status"]) => void;
  }
>;

export type CopyButtonProps = CopyButtonPropsWithoutHTML & WithoutChildren<HTMLAttributes<HTMLButtonElement>>;
