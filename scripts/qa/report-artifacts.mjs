import fs from "node:fs";
import path from "node:path";

export function createArtifactManifest(reportPath, summaryPath) {
  return [
    {
      id: "markdown_report",
      path: reportPath,
      format: "markdown",
    },
    {
      id: "json_summary",
      path: summaryPath,
      format: "json",
    },
  ];
}

function resolveArtifactPath(root, value) {
  return path.isAbsolute(value) ? value : path.join(root, value);
}

export function applyArtifactFreshness(result, { root, reportPath, summaryPath, report, summary }) {
  const reportOutputPath = resolveArtifactPath(root, reportPath);
  const summaryOutputPath = resolveArtifactPath(root, summaryPath);

  result.reportFresh = fs.existsSync(reportOutputPath) && fs.readFileSync(reportOutputPath, "utf8") === report;
  result.summaryFresh = fs.existsSync(summaryOutputPath) && fs.readFileSync(summaryOutputPath, "utf8") === summary;
  if (!result.reportFresh || !result.summaryFresh) result.status = "fail";

  return result;
}

export function writeArtifactPair({ root, reportPath, summaryPath, report, summary }) {
  const reportOutputPath = resolveArtifactPath(root, reportPath);
  const summaryOutputPath = resolveArtifactPath(root, summaryPath);

  fs.mkdirSync(path.dirname(reportOutputPath), { recursive: true });
  fs.writeFileSync(reportOutputPath, report);
  fs.mkdirSync(path.dirname(summaryOutputPath), { recursive: true });
  fs.writeFileSync(summaryOutputPath, summary);
}
