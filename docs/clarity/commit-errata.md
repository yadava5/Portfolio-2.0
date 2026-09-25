# Commit-message errata, clarity/2026-09

These commits are unpushed but already underneath later work, so they are not
reworded; rewording would rewrite every sha above them. The code in each is
correct. The sentences below in their messages are not, and this file is the
record of what is true instead.

| Commit | Claim in the message | What is true |
|---|---|---|
| `62f0b6c` fix(run): the first-scroll peek measures the corner | "G4's twelve manifest tests pass, both positive controls included." | True at `c5537c0`, not at `62f0b6c`, where the 40%/50% control was still red. |
| `62f0b6c` | "format:check … all green" | False at that sha: `ending-sequence.spec.ts` failed format until the ending worktree landed. |
| `62f0b6c` | "Rail unchanged" | Overclaims. There was no rail measurement before the change; the measured claim is "under the G10 ceilings". |
| `c5537c0` test(gate): G4's peek control sits on a measured character | The old control was "passing because `toBeGreaterThan(0)` was never reached". | Backwards. Zero hits fails that assertion, so the old control was red, not vacuously green. `55ea1a2` fixed the in-file comment; this body was left wrong. |
| `59aaedd` test(links): the viewer test proves no second tab | `popup` "is defined through the opener relationship, which `rel="noopener"` is there to sever". | Wrong as the stated reason: on Chromium the `popup` event does fire for the plate link. The choice of `context.on("page")` stands, because it catches everything `popup` does plus tabs with no opener. |
| `be69185` chore(gate): re-record the golden hash for round 11 | "every other step was green" | False. The run it was recorded from exited 1, with check-dawnscape's edge walk red at 1728×1117, 1800×1169 and 1920×1080. Superseded and corrected in `cdfa611`. |

The agents that wrote `62f0b6c`, `c5537c0` and `59aaedd` flagged these
themselves; `be69185` was found in its own rebaseline log. 2026-09-24 and 25.
