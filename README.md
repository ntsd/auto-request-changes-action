# Auto Request Changes GitHub Action

This action is a fork from [hmarr/auto-approve-action](https://github.com/hmarr/auto-approve-action)

**Name:** `ntsd/auto-request-changes-action`

Automatically request changes GitHub pull requests. The `GITHUB_TOKEN` secret will default provided as the `github-token` input for the action to work. otherwise you can add a token to `github-token` input.

## Why?

Because sometimes you want to automate create request changes review. for example, create a request changes review when a lint or testing workflow is failed.

## Usage instructions

Create a workflow file (e.g. `.github/workflows/auto-request-changes.yml`) that contains a step that `uses: ntsd/auto-request-changes-action@v2`. Here's an example workflow file:

for all github action contexts check <https://docs.github.com/en/actions/learn-github-actions/contexts>

```yaml
name: Auto request changes
on: pull_request_target

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: ntsd/auto-request-changes-action@v2
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"
          review-message: "custom review message body"
```

Combine with an `if` can only auto-request-changes with only failure workflow

```yaml
name: Auto request changes

on: pull_request_target

jobs:
  auto-request-changes:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: ntsd/auto-request-changes-action@v2
        if: ${{ github.event.pull_request && failure() }}
```

Using with [auto-approve-action](https://github.com/hmarr/auto-approve-action) to approve when the job success.

```yaml
name: Auto request changes and approve

on: pull_request_target

jobs:
  auto-review:
    runs-on: ubuntu-latest
    steps:
      - uses: ntsd/auto-request-changes-action@v2
        permissions:
          pull-requests: write
        if: ${{ github.event.pull_request && failure() }}
      - uses: hmarr/auto-approve-action@v2
        permissions:
          pull-requests: write
        if: ${{ github.event.pull_request && success() }}
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"
```

If you want to use this action from a workflow file that doesn't run on the `pull_request` or `pull_request_target` events, use the `pull-request-number` input:

```yaml
name: Auto request changes

on:
  workflow_dispatch:
    inputs: pullRequestNumber
      description: Pull request number to auto-request-changes
      required: false

jobs:
  auto-request-changes:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
    - uses: ntsd/auto-request-changes-action@v2
      with:
        pull-request-number: ${{ github.event.inputs.pullRequestNumber }}
```

## Code owners

If you're using a [CODEOWNERS file](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-code-owners), you'll need to give this action a personal access token for a user listed as a code owner. Rather than using a real user's personal access token, you're probably better off creating a dedicated bot user, and adding it to a team which you assign as the code owner. That way you can restrict the bot user's permissions as much as possible, and your workflow won't break when people leave the team.
