import * as core from "@actions/core";
import { Context } from "@actions/github/lib/context";
import nock from "nock";
import { requestChanges } from "./request-changes";

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(core, "setFailed").mockImplementation(jest.fn());
  jest.spyOn(core, "info").mockImplementation(jest.fn());

  process.env["GITHUB_REPOSITORY"] = "ntsd/test";
});

test("when a review is successfully created", async () => {
  nock("https://api.github.com")
    .post("/repos/ntsd/test/pulls/101/reviews")
    .reply(200, { id: 1 });

  await requestChanges("gh-tok", ghContext(), "comment-body");

  expect(core.info).toHaveBeenCalledWith(
    expect.stringContaining("Requested changes pull request #101"),
  );
});

test("when a review is successfully created using pull-request-number", async () => {
  nock("https://api.github.com")
    .post("/repos/ntsd/test/pulls/101/reviews")
    .reply(200, { id: 1 });

  await requestChanges("gh-tok", new Context(), "comment-body", 101);

  expect(core.info).toHaveBeenCalledWith(
    expect.stringContaining("Requested changes pull request #101"),
  );
});

test("without a pull request", async () => {
  await requestChanges("gh-tok", new Context(), "comment-body");

  expect(core.setFailed).toHaveBeenCalledWith(
    expect.stringContaining("Make sure you're triggering this"),
  );
});

test("when the token is invalid", async () => {
  nock("https://api.github.com")
    .post("/repos/ntsd/test/pulls/101/reviews")
    .reply(401, { message: "Bad credentials" });

  await requestChanges("gh-tok", ghContext(), "comment-body");

  expect(core.setFailed).toHaveBeenCalledWith(
    expect.stringContaining("`github-token` input parameter"),
  );
});

test("when the token doesn't have write permissions", async () => {
  nock("https://api.github.com")
    .post("/repos/ntsd/test/pulls/101/reviews")
    .reply(403, { message: "Resource not accessible by integration" });

  await requestChanges("gh-tok", ghContext(), "comment-body");

  expect(core.setFailed).toHaveBeenCalledWith(
    expect.stringContaining("pull_request_target"),
  );
});

test("when a user tries to request change their own pull request", async () => {
  nock("https://api.github.com")
    .post("/repos/ntsd/test/pulls/101/reviews")
    .reply(422, { message: "Unprocessable Entity" });

  await requestChanges("gh-tok", ghContext(), "comment-body");

  expect(core.setFailed).toHaveBeenCalledWith(
    expect.stringContaining("same user account"),
  );
});

test("when the token doesn't have access to the repository", async () => {
  nock("https://api.github.com")
    .post("/repos/ntsd/test/pulls/101/reviews")
    .reply(404, { message: "Not Found" });

  await requestChanges("gh-tok", ghContext(), "comment-body");

  expect(core.setFailed).toHaveBeenCalledWith(
    expect.stringContaining("doesn't have access"),
  );
});

function ghContext(): Context {
  const ctx = new Context();
  ctx.payload = {
    pull_request: {
      number: 101,
    },
  };
  return ctx;
}
