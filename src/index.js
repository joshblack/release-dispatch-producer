import { App, Octokit } from "octokit";
import core from "@actions/core";

export default async function main({ APP_ID, PRIVATE_KEY }) {
  const app = new App({
    appId: APP_ID,
    privateKey: PRIVATE_KEY,
    Octokit: Octokit.defaults({
      userAgent: "joshblack/release-dispatch-product",
      request: {
        fetch,
      },
    }),
  });

  await app.eachRepository(async ({ octokit, repository }) => {
    const owner = repository.owner.login;
    const repoUrl = repository.private
      ? `${owner}/[private]`
      : repository.html_url;

    core.debug(`ℹ️  Dispatching event for ${repoUrl} (id: ${repository.id})`);

    try {
      await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
        owner,
        repo: repository.name,
        event_type: "ping",
        client_payload: {
          message: "pong",
        },
      });

      core.info(
        `✅  Event dispatched successfully for ${repoUrl} (id: ${repository.id})`,
      );
    } catch (error) {
      core.warning("Dispatch error:", error);
    }
  });
}
