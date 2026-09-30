# Live demo copy on a test machine with one command
Status: BRAINSTORMING
Priority: 3/5
Plan type: code
Plan style: solo
Bring the PCE PCB Viewer onto Site Host's one-line live demo copy, so `sitehost demo` can stand a safe, test-mode copy of it up on a test machine.
## The idea
Luke can now type one line, `sitehost demo <site> <test machine>`, and get a demo-only copy of a site running on a test machine with its own tests passed and one verdict back. OrderBooks, CleanPay, RetroSix Auth and MailBridge already support it; MailBridge shows the shape for a site with no live data to copy, where the copy starts empty. This plan brings the PCE PCB Viewer (it lives in `PC Engine GT/PCE PCB Viewer` inside this repo) to the same standard.

Its manifest (`PC Engine GT/PCE PCB Viewer/Deployment/deploy.manifest.json`) currently says it has no demo-live profile because it holds nothing live: everything is baked into the image. With the new mechanism a copy that fetches nothing is still worth having: it proves the release stands up and passes its tests on a clean machine. Test mode here means nothing extra, since it sends nothing. If surveying the code shows a real reason this is not worth doing, say so to Luke rather than forcing it.

Reference material, all on this machine: the engine's "Demo from live" and `demoCopy` sections in `site-host-server/Source/DeploymentEngine/README.md`; OrderBooks' worked example in `orderbooks/Documentation/DemoFromLive.md` and its `demo-live` profile in `orderbooks/Deployment/deploy.manifest.json` (CleanPay, RetroSix Auth and MailBridge carry the same; MailBridge is the no-data shape); and Site Host's plan `site-host-server/Plans/01 Put a live copy of a site on a test machine with one command [In Progress].md`. Lint with `site-host-server/Source/DeploymentEngine/Scripts/demo-live-sweep.sh <this repo>`, which builds the engine from that checkout.

## Rough approach
## Findings
## Open questions
## Resume notes

## Model authorship
- 2026-09-30: claude-opus-5-5 — created plan, set section "The idea", added 4 tasks

## Agent activity log
- 2026-09-30: Added 4 task(s) by `guard plan add-tasks`.
- 2026-09-30: Guard review receipts cleared by `guard plan set-section` because section `The idea` changed.

## Tasks
- [ ] 1. Make sure the app cannot touch the real world in a demo, adding a test-mode switch only if the survey finds something it sends or drives. [risk: high]
    - Done when: a named test asserts each outbound action the survey found is stubbed in test mode, or the plan records, with the grep that proves it, that there is none
- [ ] 2. Add the demo-live profile (low danger, kept off production's names and ports) that deploys the site in test mode with a smoke test and health, and a demoCopy declaration with no group. [risk: low]
    - Done when: `site-host-server/Source/DeploymentEngine/Scripts/demo-live-sweep.sh` over this repo passes and fails again when the demoCopy line is removed
- [ ] 3. Replace the manifest's demoLive reason with a short note on what a demo copy of this site proves, and document it beside the other deployment docs. [risk: low]
    - Done when: `deploy lint` passes with no demoLive or demoCopy warning for this manifest
- [ ] 4. Real run once the site is hosted on Site Host: `sitehost demo` it to the sitehost-proof VM and read the verdict. [risk: high]
    - Done when: 🚧 needs the site on webby and Site Host plan 01 finished: `sitehost demo <site> sitehost-proof` exits 0 with a healthy verdict
