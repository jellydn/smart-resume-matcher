# 4. Dokku deploy pipeline: deploy-branch alignment, force-push, and pnpm-11 boot fix

Date: 2026-08-20

## Status

Accepted

## Context

The Deploy to Dokku workflow (`deploy-dokku.yml`) runs on every push to `main` and pushes the repo to the Dokku git remote, where a pre-receive hook builds the Docker image and swaps the container. After the bio-generator merge (PR #68), the live site 404'd on `/bio` even though the deploy run reported success. Investigation found three stacked faults:

1. **Deploy-branch mismatch — deploys silently no-op'd since Aug 4.** The `dokku/github-action` defaults to pushing `refs/heads/master`, but the Dokku app's deploy branch is `main` (`dokku git:set <app> deploy-branch main`). The push updated the `master` ref without ever triggering the build hook, so the container kept running the original Aug 4 image while the git refs claimed otherwise.
2. **Non-fast-forward ref on Dokku's `main`.** Dokku's `main` was seeded with an old deploy-setup commit (`098f206b`) that is not in our history, so a plain push to `main` was rejected.
3. **pnpm 11 reinstall at boot.** Once deploys actually built, the container started but the healthcheck failed: pnpm 11 defaults `verifyDepsBeforeRun` to `install`, so `pnpm run start` tried to reinstall production deps at boot and aborted with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` (no TTY in the runtime image).

## Decision

Fix the pipeline at three layers:

1. **Push to the app's real deploy branch.** Pass `branch: main` to `dokku/github-action` so the push lands on the branch the app actually deploys from.
2. **Force-push the deploy ref.** Pass `git_push_flags: --force`. The deploy branch is only a deployment marker — its history is not part of the product — so overwriting the stale seeded commit is safe. Add a `concurrency` group so two back-to-back merges can't race on the remote ref.
3. **Disable pnpm's pre-run dependency check.** Set `verifyDepsBeforeRun: false` in `pnpm-workspace.yaml` (the file pnpm 11 reads for this setting — the npm-config env var is not honored) and copy `pnpm-workspace.yaml` into the Dockerfile `runner` stage so the runtime pnpm sees it. Deps are already installed in the image; the pre-run check only adds a TTY-dependent reinstall.

## Consequences

### 📋 Positive

- Deploys actually build and swap the container again; the live site now serves the merged code (verified end-to-end: `/bio` returns 200 after the fix).
- The stale-image failure mode is gone: a push that doesn't trigger a build is now impossible because the action targets the app's real deploy branch.
- Force-push + serialized concurrency makes the deploy ref idempotent and race-free for back-to-back merges.
- The pnpm-11 boot fix is documented next to the other deliberate pnpm-11 settings in `pnpm-workspace.yaml`, so future "cleanups" don't reintroduce the TTY abort.

### 📋 Negative

- Force-pushing the Dokku deploy ref discards whatever history Dokku's `main` held (none of it was product history — it was a stale seeded commit).
- The deploy branch must stay in sync with the workflow's `branch: main` input; if the app's deploy branch ever changes, the workflow must change with it.
- Runtime images now depend on `pnpm-workspace.yaml` being present in the `runner` stage; a future Dockerfile refactor that drops the copy silently reintroduces the boot-time reinstall.